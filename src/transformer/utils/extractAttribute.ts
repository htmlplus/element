import t from '@babel/types';

import * as CONSTANTS from '../../constants/index.js';

export const extractAttribute = (property: t.ClassProperty): string | undefined => {
  try {
    return (property.decorators as any)
      .find((decorator) => decorator.expression.callee.name == CONSTANTS.DECORATOR_PROPERTY)
      .expression.arguments[0].properties.find((property) => property.key.name == 'attribute').value
      .value;
  } catch {}
};
