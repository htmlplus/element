export const getFramework = (target) => {
    const keys = Object.keys(target);
    const has = (key) => keys.some((key) => key.startsWith(key));
    if (has('__zone_symbol__'))
        return 'angular';
    if (has('__react'))
        return 'react';
    if (has('__svelte'))
        return 'svelte';
    if (has('__vnode'))
        return 'vue';
};
