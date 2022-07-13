<!--
 * @Date: 2021-05-17 21:49:05
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-07-19 20:56:50
-->

# aliyun-pages-proxy

本工具仅在 github pages 设置自定义域名的情况下工作

加速域名 <https://i.songe.li/>

## 具体实现

首先设置 首先设置云解析

- 海外地区 CNAME 记录 lisonge.github.io
- 大陆地区 CNAME 记录 1887623261562936.cn-hongkong.fc.aliyuncs.com

全局安装 `@serverless-devs/s` 并配置密钥，然后进入项目目录

```shell
pnpm run build
pnpm run deloy
```

然后在控制台绑定自定义域名和路径

这样大陆用户访问的就是 香港的服务，再代理到 github pages，就能加速访问到实际的页面资源

## 附加功能

- `url.searchParams` 不含 `CDN` 且 请求头字段 `accept` 不包含 `text/html` 会 301 到 `cdn.jsdelivr.com`
- `url.searchParams` 若包含 `CDN=ON`, 则 301 到 `cdn.jsdelivr.com`
