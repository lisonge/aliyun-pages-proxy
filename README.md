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

部署域名 <https://i.songe.li/>

## 具体实现

首先设置 首先设置云解析

- 海外地区 CNAME 记录 lisonge.github.io
- 大陆地区 CNAME 记录 1887623261562936.cn-hongkong.fc.aliyuncs.com

然后绑定 github pages 自定义域名

然后在 阿里云函数计算 香港地区 新建 node14 函数 部署

对于 https ，需要在 `阿里云 SSL 证书` 申请一个免费的 证书

在函数计算-高级功能 域名管理 添加 自定义域名 i.songe.li ，上传证书，设置路径 /\* 指向刚刚部署的函数

## 附加功能

- 对于 GET，`url.searchParams` 不含 `CDN_302` 且 请求头字段 `accept` 不包含 `text/html` 会 `302` 到 `cdn.jsdelivr.com`
- 若包含 `CDN_302=ON`, 则 302 到 `cdn.jsdelivr.com`
- 若包含 `CDN_302=OFF`, 则不会 302 到 `cdn.jsdelivr.com`
