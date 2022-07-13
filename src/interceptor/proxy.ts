import { Response, Request, Headers } from 'node-fetch';
import { URL } from 'url';
import { config } from '../config';
import { BeforeForwardHook, Next, End } from '../core/middleware';

const proxyUrl = new URL(config.forwardUrl);

export const proxyHook: BeforeForwardHook = (req) => {
  const url = new URL(req.url);
  url.protocol = proxyUrl.protocol;
  url.hostname = proxyUrl.hostname;
  url.port = proxyUrl.port;
  url.username = proxyUrl.username;
  url.password = proxyUrl.password;
  proxyUrl.searchParams.forEach((v, n) => {
    url.searchParams.set(n, v);
  });
  if (proxyUrl.pathname != '/') {
    if (proxyUrl.pathname.endsWith('/')) {
      url.pathname = proxyUrl.pathname + url.pathname.slice(1);
    } else {
      url.pathname = proxyUrl.pathname + url.pathname;
    }
  }
  return Next.from(new Request(url, req));
};

export const cdnHook: BeforeForwardHook = (req) => {
  const url = new URL(req.url);
  const CDN = url.searchParams.get('CDN');
  const accept = req.headers.get('accept');

  if ((!accept?.includes('text/html') && CDN === null) || CDN == 'ON') {
    let Location = url.pathname + url.search;
    if (config.cdnBaseUrl.endsWith('/')) {
      Location = config.cdnBaseUrl + Location.substring(1);
    } else {
      Location = config.cdnBaseUrl + Location;
    }
    const resp = new Response(undefined, {
      status: 301,
      headers: {
        Location,
      },
    });
    return End.from(resp);
  }
};
