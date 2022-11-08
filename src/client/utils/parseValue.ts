import * as CONSTANTS from '../../constants/index.js';
import { toBoolean } from './toBoolean.js';

// TODO: input type & validate date
export const parseValue = (value: any, type: any): any => {
  switch (type) {
    case CONSTANTS.TYPE_BOOLEAN:
      return toBoolean(value);
    case CONSTANTS.TYPE_DATE:
      return new Date(value);
    case CONSTANTS.TYPE_NUMBER:
      return isNaN(value) ? value : parseFloat(value);
    default:
      return value;
  }
};
