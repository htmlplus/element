import core from 'sass';
import { Context } from '../types/index.js';

export interface ScssOptions { }

export const scss = (options?: ScssOptions) => {

    const name = 'scss';

    const next = (context: Context) => {

        if (!context.stylePath) return;

        const { css, stats } = core.renderSync({
            file: context.stylePath,
            outputStyle: 'compressed',
            ...options || {},
        });

        context.styleParsed = css.toString();

        context.styleDependencies = Array.from(stats.includedFiles);
    }

    return {
        name,
        next,
    }
}