/*
 * @Date: 2021-03-18 15:48:07
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-08-19 15:45:39
 */

import { Response } from 'node-fetch';
import {
  AfterForwardHook,
  BeforeForwardHook,
  End,
  Next,
} from '../core/middleware';

/**
 * 控制预检请求
 * @param req
 * @returns
 */
export const corsPreflightedHook: BeforeForwardHook = (req) => {
  if (req.method === 'OPTIONS') {
    return End.from(new Response());
  }
};

/**
 * 跨域控制
 * @param resp
 * @returns
 */
export const corsAfterHook: AfterForwardHook = (resp) => {
  const headers = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': '*',
    'access-control-allow-headers': '*',
  } as { [key: string]: string };
  for (const key in headers) {
    resp.headers.set(key, headers[key]);
  }
  return Next.from(resp);
};
