import http2 from 'http2';

(async function () {
  // 一条 tcp 连接
  const session = http2.connect('https://dev.songe.li', {
    lookup: (hostname, options, callback) => {
      callback(null, '185.199.110.153', 4);
    },
  });
  // 一个 http 会话, http2 是多路复用的
  const stream = session.request({ ':path': '/' });
  stream.on('response', (headers, flags) => {
    console.log(headers[http2.constants.HTTP2_HEADER_STATUS]);
    for (const name in headers) {
      console.log(`${name}: ${headers[name]}`);
    }
  });
  // stream.setEncoding('hex');
  const chunkList: Buffer[] = [];
  stream.on('data', (chunk: Buffer) => {
    chunkList.push(chunk);
  });
  stream.on('end', () => {
    const data = Buffer.concat(chunkList);
    console.log(`\n${data.toString('utf-8')}`);
    session.close();
  });
  stream.end();
})();
