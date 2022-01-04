import * as CONSTANTS from '../../configs/constants.js';
import { toBoolean } from './to-boolean.js';

// TODO: input type
export const parseValue = (value: any, type: any) => {

  switch (type) {

    case CONSTANTS.TYPE_BOOLEAN:
      return toBoolean(value);

    case CONSTANTS.TYPE_NUMBER:
      return parseFloat(value);

    default:
      return value;
  }
}