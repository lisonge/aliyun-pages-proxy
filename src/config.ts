import TOML from '@iarna/toml';
import { readFileSync } from 'fs';
import { join } from 'path';

type Config = {
  author: string;
  forwardUrl: string;
  cdnBaseUrl: string;
};

export const config = TOML.parse(
  readFileSync(join(process.cwd(), '/config.toml'), 'utf-8')
) as unknown as Config;
