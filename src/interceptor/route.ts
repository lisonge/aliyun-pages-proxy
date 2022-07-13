/*
 * @Author: lisonge
 * @Date: 2021-08-19 15:44:02
 * @LastEditTime: 2021-08-19 15:44:24
 * @LastEditors: lisonge
 */
import { Response } from 'node-fetch';
import { URL } from 'url';
import { config } from '../config';
import { BeforeForwardHook, End } from '../core/middleware';

// 微信内置浏览器 ua Mozilla/5.0 (Linux; Android 12; M2012K11AC Build/SKQ1.211006.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4263 MMWEBSDK/20220604 Mobile Safari/537.36 MMWEBID/2203 MicroMessenger/8.0.24.2180(0x2800183F) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64
