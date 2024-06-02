import { HTMLPlusElement } from '../../types/index.js';
import { host } from './host.js';

export const getFramework = (target: HTMLElement | HTMLPlusElement): string | undefined => {
  const element = host(target);

  if ('_qc_' in element) return 'qwik';

  if ('_$owner' in element) return 'solid';

  if ('__svelte_meta' in element) return 'svelte';

  if ('__vnode' in element) return 'vue';

  const keys = Object.keys(element);

  const has = (input) => keys.some((key) => key.startsWith(input));

  if (has('_blazor')) return 'blazor';

  if (has('__react')) return 'react';

  if (has('__zone_symbol__')) return 'angular';
};
