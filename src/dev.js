import { createServer } from 'vite';
import compiler from '../dist/compiler/index.js';
import {
  attach,
  extract,
  parse,
  print,
  uhtml,
  validate,
} from '../dist/compiler/index.js';

const content = `
import { Element, slots } from '@htmlplus/element';

@Element()
export class MyElement {
  loadedCallback(){
    
    console.log(123, slots(this))
  }
  render() {
    return (
      <>
      <h1><slot/></h1>
      <h1><slot name="a"/></h1>
      </>
    )
  }
}
`

const { start, next, finish } = compiler(
  {
    name: 'read',
    next(context) {
      context.fileContent = content
    }
  },
  parse(),
  validate(),
  extract(),
  attach({
    typings: false
  }),
  uhtml(),
  print(),
);

createServer({
  server: {
    open: true,
  },
  plugins: [
    {
      name: 'htmlplus',
      async buildStart() {
        await start();
      },
      resolveId(id) {

        if (id == '@htmlplus/element')
          return '../dist/client/index.js';

        if (id == '@htmlplus/element/runtime')
          return '../dist/runtime/index.js';
      },
      async load(id) {

        if (!id.endsWith('bundle.ts')) return;

        const { script } = await next('');

        return script;
      },
      async buildEnd() {
        await finish();
      }
    }
  ]
})
  .then((server) => server.listen())
  .catch((error) => console.log(error));