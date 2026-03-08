import { ReadableStream } from 'web-streams-polyfill/ponyfill'
// --- 将此块放在文件的最顶部 ---
// import fetch, { Headers, Request, Response } from 'node-fetch';

import 'cross-fetch/polyfill';
if (!global.ReadableStream) {
  global.ReadableStream = ReadableStream 
}
