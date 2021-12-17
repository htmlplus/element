import { parse as parser } from '@babel/parser';
import { Context } from '../types/index.js';

export const parse = () => {

    const name = 'parse';

    const next = (context: Context) => {

        if (!!context.ast) return;

        context.ast = parser(
            context.content || '',
            {
                allowImportExportEverywhere: true,
                plugins: [
                    'jsx',
                    'typescript',
                    'decorators-legacy'
                ]
            }
        )
    }

    return {
        name,
        next,
    }
}