import t from '@babel/types';
import * as CONSTANTS from '../configs/constants.js';
import { Context } from '../types/index.js';

export interface AttachOptions {
  members?: boolean;
  styles?: boolean;
}

export const attach = (options: AttachOptions) => {

  const name = 'attach';

  const next = (context: Context) => {

    if (options.styles && context.styleParsed)
      context.component?.body.body.unshift(
        t.classProperty(
          t.identifier(CONSTANTS.TOKEN_STATIC_STYLES),
          t.stringLiteral(context.styleParsed),
          undefined,
          null,
          undefined,
          true
        )
      )

    if (options.members) {

      context.component?.body.body.unshift(
        t.classProperty(
          t.identifier(CONSTANTS.TOKEN_STATIC_MEMBERS),
          t.arrayExpression(
            [
              ...(context.properties || []).map((property) => {

                const type = (property as any).typeAnnotation?.typeAnnotation?.type;

                const elements: Array<any> = [
                  t.stringLiteral(property.key['name'])
                ];

                if (type == 'TSBooleanKeyword')
                  elements.push(t.stringLiteral(CONSTANTS.TYPE_BOOLEAN));

                if (type == 'TSStringKeyword')
                  elements.push(t.stringLiteral(CONSTANTS.TYPE_STRING));

                if (type == 'TSNumberKeyword')
                  elements.push(t.stringLiteral(CONSTANTS.TYPE_NUMBER));

                return t.arrayExpression(elements);
              }),
              ...(context.methods || []).map((property) => {

                const elements: Array<any> = [
                  t.stringLiteral(property.key['name']),
                  t.stringLiteral(CONSTANTS.TYPE_FUNCTION)
                ];

                return t.arrayExpression(elements);
              })
            ]
          ),
          undefined,
          undefined,
          undefined,
          true,
        )
      )
    }
  }

  return {
    name,
    next,
  }
}
