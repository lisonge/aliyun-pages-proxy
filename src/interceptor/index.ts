import { AfterForwardHook, BeforeForwardHook } from '../core/middleware';

import { corsAfterHook, corsPreflightedHook } from './cors';
import { proxyHook, cdnHook } from './proxy';

export const beforeFuncList: BeforeForwardHook[] = [
  corsPreflightedHook,
  proxyHook,
  cdnHook,
];
export const afterFuncList: AfterForwardHook[] = [corsAfterHook];
