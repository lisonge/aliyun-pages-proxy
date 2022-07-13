/*
 * @Date: 2021-05-27 14:55:42
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-05-27 14:56:48
 */
import { Headers, Request, Response } from 'node-fetch';
import http2 from 'http2';
import { constants } from 'http2';
const { HTTP2_HEADER_PATH, HTTP2_HEADER_METHOD } = constants;
import { promises as dns } from 'dns';
import { URL } from 'url';

export default class DnsHookHttp2Session {
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
        stream.end();
      });
    });
    console.log(respBuffer.toString('utf-8'));
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
    console.log('DnsHookHttp2Session.create');
    return new DnsHookHttp2Session(session);
  }
}

Buffer.from('', 'base64').toString('utf-8');
