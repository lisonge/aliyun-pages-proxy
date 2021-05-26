/*
 * @Date: 2021-05-17 21:28:29
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-05-26 23:18:44
 */
import 'source-map-support/register';
import 'core-js';

import { AliyunContext, AliyunRequest, AliyunResponse } from './@types/aliyun';
import { aliyunReq2nodeReq, nodeResp2aliyunResp } from './util';
import { Headers, Request, Response } from 'node-fetch';
import http2 from 'http2';
import { constants } from 'http2';
const { HTTP2_HEADER_PATH, HTTP2_HEADER_METHOD } = constants;
import { promises as dns } from 'dns';
import { URL } from 'url';

export class DnsHookHttp2Session {
  session: http2.ClientHttp2Session;
  private constructor(session: http2.ClientHttp2Session) {
    this.session = session;
  }
  async destroy() {
    await new Promise<void>((resolve, reject) => {
      this.session.close(resolve);
    });
  }
  async invoke(req: Request): Promise<Response> {
    const { method, url, headers } = req;
    const u = new URL(url);
    const h = new Headers(headers);
    ['host'].forEach((v) => {
      h.delete(v);
    });

    const stream = this.session.request({
      ...h.raw(),
      [HTTP2_HEADER_PATH]: u.pathname + u.search,
      [HTTP2_HEADER_METHOD]: method,
    });
    if (method != 'GET') {
      stream.write(req.body);
    }
    let statusCode: number = 200;
    const respHeaders = new Headers();
    stream.on('response', (headers, flags) => {
      statusCode = headers[':status']!;
      for (const name in headers) {
        const value = headers[name];
        if (typeof value == 'string') {
          respHeaders.set(name, value);
        } else if (value instanceof Array) {
          value.forEach((v) => {
            respHeaders.append(name, v);
          });
        }
      }
    });
    const chunkList: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunkList.push(chunk);
    });
    const respBuffer = await new Promise<Buffer>((resolve, reject) => {
      stream.on('end', () => {
        resolve(Buffer.concat(chunkList));
        // const data = Buffer.concat(chunkList);
        // console.log(`\n${data.toString('utf-8')}`);
        // session.close();
      });
      stream.end();
    });
    const resp = new Response(respBuffer, {
      headers: respHeaders,
      status: statusCode,
    });
    return resp;
  }
  /**
   *
   * @param httpHost http报文中host
   * @param dnsHost dns使用的host, 默认是httpHost
   */
  static async create(httpHost: string, dnsHost?: string) {
    const hU = new URL(`https://${httpHost}`);
    const { address, family } = await dns.lookup(dnsHost ?? hU.hostname);
    const session = http2.connect(hU.origin, {
      lookup: (hostname, options, callback) => {
        callback(null, address, family);
      },
    });
    return new DnsHookHttp2Session(session);
  }
}

let session: DnsHookHttp2Session | null = null;
export const aliyunHandler = async (
  aliyunReq: AliyunRequest,
  aliyunResp: AliyunResponse,
  aliyunCtx: AliyunContext
) => {
  const req = await aliyunReq2nodeReq(aliyunReq);

  // <<<------------------------------------------
  // 这里应该分离出一个拦截器，作为懒狗我就不写了
  if (req.method == 'GET') {
    const { headers } = req;
    const url = new URL(req.url);
    if (
      url.searchParams.has('302_CDN') ||
      !(headers.get('accept') ?? '').includes('text/html')
    ) {
      const Location = `https://cdn.jsdelivr.net/gh/lisonge/lisonge.gitHub.io@master${url.pathname}${url.search}`;
      const resp = new Response(undefined, {
        status: 302,
        headers: {
          Location,
        },
      });
      await nodeResp2aliyunResp(resp, aliyunResp);
      return;
    }
  }
  // <<<------------------------------------------

  if (session == null) {
    session = await DnsHookHttp2Session.create(
      'dev.songe.li',
      'lisonge.github.io'
    );
  }
  const resp = await session.invoke(req);
  await nodeResp2aliyunResp(resp, aliyunResp);
};
