/**
 * Indicates whether the current code is running on a server.
 */
export const isServer = () => {
    return !(typeof window != 'undefined' && window.document);
};
