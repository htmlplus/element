/**
 * Determines if the current code is running on a server.
 */
export const isServer = (): boolean => {
  return !(typeof window != 'undefined' && window.document);
};
