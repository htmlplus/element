import * as CONSTANTS from '../../configs/constants.js';
import { Api } from '../../types';

export const api = (target): Api => target[CONSTANTS.TOKEN_API];
