export const isServer = (): boolean => {
  return !(typeof window != 'undefined' && window.document);
};
