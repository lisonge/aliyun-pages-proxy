/*
 * @Date: 2021-05-21 23:07:07
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-05-24 17:20:56
 */
import { Request } from 'node-fetch';
import { DnsHookHttp2Session } from '../src/index';

(async function () {
  const session = await DnsHookHttp2Session.create(
    'dev.songe.li',
    'lisonge.github.io'
  );

  const resp = await session.invoke(
    new Request('https://dev.songe.li/', { method: 'GET' })
  );
  console.log(await resp.text());
  console.log('\n');
  console.log(resp.headers.raw());
  console.log('\n');
  console.log(resp.status);
  await session.destroy();
})();
