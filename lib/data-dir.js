import path from 'node:path';
import { tmpdir } from 'node:os';

export function dataDirectory() {
  return path.join(tmpdir(), 'maia-demo');
}
