import { createCompiler } from './compiler.js'
import * as plugins from './plugins/index.js'

const { start, next, finish } = createCompiler(
  plugins.read(),
  plugins.parse(),
  plugins.validate(),
  plugins.extract({
    prefix: "plus",
  }),
  // plugins.scss({
  //   includePaths: ["./src/styles"],
  // }),
  plugins.attach({
    members: true,
    styles: true,
  }),
  plugins.uhtml(),
  plugins.print()
);

(async () => {
  await start()

  const { script } = await next(
    // 'C:\\Users\\Samar\\Desktop\\dev\\packages\\core.new\\src\\components\\aspect-ratio\\aspect-ratio.tsx'
    'C:\\Users\\RD110\\Desktop\\dev\\packages\\components\\src\\components\\aspect-ratio\\aspect-ratio.tsx'
  )

  await finish()
})()