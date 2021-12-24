import compiler from '../dist/compiler/index.js';
import * as plugins from '../dist/compiler/index.js';

const { start, next, finish } = compiler(
  plugins.read(),
  plugins.parse(),
  plugins.validate(),
  plugins.extract({
    prefix: "plus",
  }), 
  // plugins.scss({
  //   includePaths: ["./src/styles"],
  // }),
  plugins.attach(),
  plugins.uhtml(),
  plugins.print()
);

(async () => {
  await start()

  const { script } = await next(
    'C:\\Users\\Masood\\Desktop\\dev\\packages\\components\\src\\components\\browse\\browse.tsx'
    // 'C:\\Users\\RD110\\Desktop\\dev\\packages\\components\\src\\components\\aspect-ratio\\aspect-ratio.tsx'
  )

  console.log(1111, script)

  await finish()
})()