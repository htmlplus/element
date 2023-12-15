import { print } from './print.js';

// TODO
// args types
// return type
// elements\grid-item\grid-item.types.ts
// elements\portal\portal.tsx
export const printType = (ast) => {
  if (!ast) return ast;

  let result: any = {};

  switch (ast.type) {
    case 'BooleanLiteral':
    case 'NumericLiteral':
    case 'StringLiteral': {
      result.key = ast.value;
      result.type = ast.type.replace('Literal', '').toLowerCase();
      break;
    }

    case 'TSBooleanKeyword':
    case 'TSNumberKeyword':
    case 'TSStringKeyword': {
      const type = ast.type.replace('TS', '').replace('Keyword', '').toLowerCase();
      result.key = type;
      result.type = type;
      break;
    }

    case 'TSAnyKeyword': {
      result.type = 'any';
      break;
    }

    case 'TSArrayType': {
      const type = print(ast.elementType) + '[]';
      result.key = type;
      result.type = type;
      break;
    }

    case 'TSInterfaceDeclaration': {
      result.type = ast.id.name;
      result.members = ast.body.body.map((body) => printType(body));
      break;
    }

    case 'TSLiteralType': {
      result = printType(ast.literal);
      break;
    }

    case 'TSPropertySignature': {
      const { typeAnnotation } = ast;
      result.key = ast.key.name;

      if (typeAnnotation && typeAnnotation.typeAnnotation)
        result.type = printType(ast.typeAnnotation.typeAnnotation).type;

      break;
    }

    case 'TSTypeAliasDeclaration': {
      result = printType(ast.typeAnnotation);
      break;
    }

    case 'TSTypeReference': {
      result.key = ast.typeName.name;
      result.type = ast.typeName.name;
      break;
    }

    case 'TSUnionType': {
      result.type = print(ast);
      result.members = ast.types.map((type) => printType(type));
      break;
    }
  }

  return result;
};
