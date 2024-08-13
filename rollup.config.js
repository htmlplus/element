import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { dts } from "rollup-plugin-dts";

const input = {
  'bundlers': 'src/bundlers/index.ts',
  'constants': 'src/constants/index.ts',
  'client': 'src/client/index.ts',
  'internal': 'src/client/internal/index.ts',
  'transformer': 'src/transformer/index.ts',
};

const output = {
  dir: 'dist',
  format: 'esm',
  manualChunks(id) {
    for (const key of Object.keys(input)) {
      if (id.includes(`/src/${key}/`))
        return key;
    }
  },
};

export default defineConfig([
  {
    input,
    output,
    plugins: [
      nodeExternals(),
      typescript(),
    ],
  },
  {
    input,
    output,
    plugins: [
      dts()
    ],
  }
]);