export const getFramework = (target) => {
    if ('_qc_' in target)
        return 'qwik';
    if ('_$owner' in target)
        return 'solid';
    if ('__svelte_meta' in target)
        return 'svelte';
    if ('__vnode' in target)
        return 'vue';
    const keys = Object.keys(target);
    const has = (input) => keys.some((key) => key.startsWith(input));
    if (has('__zone_symbol__'))
        return 'angular';
    if (has('__react'))
        return 'react';
};
