import fetch, { BodyInit, Request, Response } from 'node-fetch';
import { afterFuncList, beforeFuncList } from '../interceptor';
import { BaseError } from './error';
import { End, Next } from './middleware';

export const handler = async (req: Request): Promise<Response> => {
  try {
    let respTemp: Response | undefined = undefined;
    console.log('beforeFuncList', beforeFuncList.map((f) => f.name).toString());
    for (const beforeFunc of beforeFuncList) {
      const result = await beforeFunc(req);
      if (result instanceof Next) {
        req = result.value;
        console.log('next', req.url);
      } else if (result instanceof End) {
        const { value } = result;
        if (value instanceof Request) {
          req = value;
          console.log('end.req', req.url);
          break;
        } else {
          console.log('end.resp', value.status);
          respTemp = value;
          break;
        }
      } else {
        console.log('void', beforeFunc.name);
      }
    }

    if (!respTemp) {
      console.log('fetch req.url', req.url);
      respTemp = await fetch(req);
      console.log('fetch resp.status', respTemp.status);
    }
    const resp = respTemp;

    console.log('afterFuncList', afterFuncList.map((f) => f.name).toString());
    for (const afterFunc of afterFuncList) {
      const result = await afterFunc(resp, req);
      if (result !== undefined) {
        const { value } = result;
        if (result instanceof Next) {
          respTemp = value;
        } else {
          return value;
        }
      }
    }
    return respTemp;
  } catch (error) {
    let statusCode = 500;
    let body: BodyInit;
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json; charset=utf-8',
    } as { [key: string]: string };

    if (error instanceof Error) {
      if (error instanceof BaseError) {
        statusCode = error.status;
        body = error.stringify();
      } else {
        const { message, stack, name } = error;
        body = JSON.stringify({ message, name, stack }, undefined, 2);
      }
    } else {
      body = JSON.stringify({ message: 'unknown error', error }, undefined, 2);
    }
    return new Response(body);
  }
};
