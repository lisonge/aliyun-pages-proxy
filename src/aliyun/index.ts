import { handler } from '../core';
import { aliyunReq2nodeReq, nodeResp2aliyunResp } from './transform';
import type { AliyunContext, AliyunRequest, AliyunResponse } from './types';

export const aliyunHandler = async (
  aliyunReq: AliyunRequest,
  aliyunResp: AliyunResponse,
  aliyunCtx: AliyunContext
) => {
  let req = await aliyunReq2nodeReq(aliyunReq);
  console.log('raw_req', req.url);
  const resp = await handler(req);
  console.log('resp.status', resp.status);
  nodeResp2aliyunResp(resp, aliyunResp);
};
