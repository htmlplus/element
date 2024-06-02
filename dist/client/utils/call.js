export const call = (target, key, ...parameters) => {
    return target[key]?.call(target, ...parameters);
};
