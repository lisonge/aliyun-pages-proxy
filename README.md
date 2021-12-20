<!--
 * @Date: 2021-05-17 21:49:05
 * @LastEditors: lisonge
 * @Author: lisonge
 * @LastEditTime: 2021-07-19 20:56:50
-->

# aliyun-pages-proxy

基于 `域名双线解析` 和 `DNS拦截` 的 Github Pages 代理镜像 并使用 `HTTP2` 加速的 函数计算 工具

部署于 中国香港 阿里云，运行于 阿里云 函数计算 中国香港地区 使用免费额度

可解决 github pages 在某些线路(例如成都联通)的 dns 解析阶段被 `墙` 而造成无法访问的情况

本工具仅在 github pages 设置自定义域名的情况下工作

部署域名 <https://dev.songe.li/>

## 附加功能

- 对于 GET，`url.searchParams` 不含 `CDN_302` 且 请求头字段 `accept` 不包含 `text/html` 会 `302` 到 `cdn.jsdelivr.com`

- 若包含 `CDN_302`, 且 `CDN_302=on` 会 `302` 到 `cdn.jsdelivr.com`

- 对于 GET 或 HEAD 请求 ，强制 301 重定向至 https，其他则 308 重定向至 https
