import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy'
import { dts } from 'rollup-plugin-dts';
import { nodeExternals } from 'rollup-plugin-node-externals';

const input = {
  bundlers: 'src/bundlers/index.ts',
  constants: 'src/constants/index.ts',
  client: 'src/client/index.ts',
  internal: 'src/client/internal/index.ts',
  transformer: 'src/transformer/index.ts'
};

const output = {
  dir: 'dist',
  format: 'esm',
  manualChunks(id) {
    for (const key of Object.keys(input)) {
      if (id.includes(`/src/${key}/`)) return key;
    }
  }
};

export default defineConfig([
  {
    input,
    output,
    plugins: [
      nodeExternals(),
      typescript(),
      copy({
        flatten: true,
        targets: [
          {
            dest: output.dir,
            src: ['package-lock.json', 'README.md', 'src/jsx-runtime.d.ts'],
          },
          {
            dest: output.dir,
            src: 'package.json',
            transform(contents) {
              return JSON.stringify({ ...JSON.parse(contents), scripts: undefined }, null, 2);
            }
          }
        ]
      })
    ]
  },
  {
    input,
    output,
    plugins: [dts()]
  }
]);
