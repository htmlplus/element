import * as CONSTANTS from '../../constants/index.js';
import { typeOf } from './typeOf.js';

export const toProperty = (input: any, type: number | undefined) => {
  if (type === undefined) return input;

  const string = `${input}`;

  if (CONSTANTS.TYPE_BOOLEAN & type) {
    if (string === '') return true;
    if (string === 'true') return true;
    if (string === 'false') return false;
  }

  if (CONSTANTS.TYPE_NUMBER & type) {
    if (string != '' && !isNaN(input)) {
      return parseFloat(input);
    }
  }

  if (CONSTANTS.TYPE_NULL & type) {
    if (string === 'null') {
      return null;
    }
  }

  if (CONSTANTS.TYPE_DATE & type) {
    const value = new Date(input);
    if (value.toString() != 'Invalid Date') {
      return value;
    }
  }

  if (CONSTANTS.TYPE_ARRAY & type) {
    try {
      const value = JSON.parse(input);
      if (typeOf(value) == 'array') {
        return value;
      }
    } catch {}
  }

  if (CONSTANTS.TYPE_OBJECT & type) {
    try {
      const value = JSON.parse(input);
      if (typeOf(value) == 'object') {
        return value;
      }
    } catch {}
  }

  if (CONSTANTS.TYPE_UNDEFINED & type) {
    if (string === 'undefined') {
      return undefined;
    }
  }

  return input;
};
