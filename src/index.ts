/*
 * @Date: 2021-05-17 21:28:29
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-07-19 20:53:21
 */
import 'source-map-support/register';
import 'core-js';

import { AliyunContext, AliyunRequest, AliyunResponse } from './@types/aliyun';
import { aliyunReq2nodeReq, nodeResp2aliyunResp } from './util';
import { Headers, Request, Response } from 'node-fetch';
import { URL } from 'url';
import DnsHookHttp2Session from './core/DnsHookHttp2Session';

let session: DnsHookHttp2Session | null = null;
export const aliyunHandler = async (
  aliyunReq: AliyunRequest,
  aliyunResp: AliyunResponse,
  aliyunCtx: AliyunContext
) => {
  // <<<------------------------------------------
  // 初始化配置
  const branch = 'master';
  const username = 'lisonge';
  const customDomain = 'dev.songe.li';
  // <<<------------------------------------------

  const req = await aliyunReq2nodeReq(aliyunReq);

  // <<<------------------------------------------
  // 这里应该分离出一个拦截器，作为懒狗我就不写了
  const url = new URL(req.url);
  // 强制https
  if (url.protocol == 'http:') {
    const u2 = new URL(url.href);
    u2.protocol = 'https:';
    const resp = new Response(undefined, {
      status: ['GET', 'HEAD'].includes(req.method) ? 301 : 308,
      headers: {
        Location: u2.href,
      },
    });
    await nodeResp2aliyunResp(resp, aliyunResp);
    return;
  }
  if (req.method == 'GET') {
    const { headers } = req;
    const CDN_302 = url.searchParams.get('CDN_302');
    let useCdn = false;
    if (CDN_302 == null) {
      useCdn = headers.get('accept')?.includes('text/html') === false;
    } else {
      useCdn = CDN_302 == 'on';
    }
    if (useCdn) {
      let Location = `https://cdn.jsdelivr.net/gh/${username}/${username}.gitHub.io@`;
      Location += encodeURIComponent(branch) + url.pathname + url.search;
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
      customDomain,
      `${username}.github.io`
    );
  }
  const resp = await session.invoke(req);
  await nodeResp2aliyunResp(resp, aliyunResp);
};
