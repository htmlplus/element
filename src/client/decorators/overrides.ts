import { type Config, getConfig, getNamespace, host, wrapMethod } from '@/client/utils';
import * as CONSTANTS from '@/constants';
import type { HTMLPlusElement } from '@/types';

type DisposerMap = Map<string, () => void>;

export type OverridesConfig<Breakpoint extends string, Properties = unknown> = {
	[Key in Breakpoint]?: Partial<Properties>;
};

const CONTAINER_DATA = Symbol();

const getContainers = (breakpoints?: Config['breakpoints']) => {
	return Object.entries(breakpoints || {}).reduce(
		(result, [key, breakpoint]) => {
			if (breakpoint.type !== 'container') return result;

			result[key] = {
				min: breakpoint.min,
				max: breakpoint.max
			};

			return result;
		},
		{} as Record<
			string,
			{
				min?: number;
				max?: number;
			}
		>
	);
};

const getMedias = (breakpoints?: Config['breakpoints']): Record<string, string> => {
	return Object.entries(breakpoints || {}).reduce(
		(result, [key, breakpoint]) => {
			if (breakpoint.type !== 'media') return result;

			const parts: string[] = [];

			const min = 'min' in breakpoint ? breakpoint.min : undefined;
			const max = 'max' in breakpoint ? breakpoint.max : undefined;

			if (min !== undefined) parts.push(`(min-width: ${min}px)`);
			if (max !== undefined) parts.push(`(max-width: ${max}px)`);

			const query = parts.join(' and ');

			if (query) result[key] = query;

			return result;
		},
		{} as Record<string, string>
	);
};

const matchContainer = (element: HTMLElement, container: { min?: number; max?: number }) => {
	const getData = () => {
		if (element[CONTAINER_DATA]) return element[CONTAINER_DATA];

		const listeners = new Set<() => void>();

		const observer = new ResizeObserver(() => {
			listeners.forEach((listener) => {
				listener();
			});
		});

		observer.observe(element);

		element[CONTAINER_DATA] = { listeners, observer };

		return element[CONTAINER_DATA];
	};

	const getMatches = () => {
		const width = element.offsetWidth;

		const matches =
			(container.min === undefined || width >= container.min) &&
			(container.max === undefined || width <= container.max);

		return matches;
	};

	const addEventListener = (_type: 'change', listener: () => void) => {
		getData().listeners.add(listener);
	};

	const removeEventListener = (_type: 'change', listener: () => void) => {
		const data = getData();

		data.listeners.delete(listener);

		if (data.listeners.size !== 0) return;

		data.observer.disconnect();

		delete element[CONTAINER_DATA];
	};

	return {
		get matches() {
			return getMatches();
		},
		addEventListener,
		removeEventListener
	};
};

export function Overrides() {
	return (target: HTMLPlusElement, key: string) => {
		const DISPOSERS = Symbol();

		const breakpoints = getConfig(getNamespace(target) || '').breakpoints || {};

		const containers = getContainers(breakpoints);

		const medias = getMedias(breakpoints);

		wrapMethod(
			'after',
			target,
			CONSTANTS.LIFECYCLE_UPDATE,
			function (states: Map<string, unknown>) {
				if (!states.has(key)) return;

				this[DISPOSERS] ??= new Map();

				const disposers = this[DISPOSERS] as DisposerMap;

				const overrides = this[key] || {};

				const activeKeys = new Set(disposers.keys());

				const overrideKeys = Object.keys(overrides);

				const containerKeys = overrideKeys.filter((breakpoint) => breakpoint in containers);

				const mediaKeys = overrideKeys.filter((breakpoint) => breakpoint in medias);

				let next = {};

				let scheduled = false;

				const apply = (overrideKey?: string) => {
					overrideKey && Object.assign(next, overrides[overrideKey]);

					if (scheduled) return;

					scheduled = true;

					queueMicrotask(() => {
						scheduled = false;

						const defaults = Object.assign({}, this[CONSTANTS.API_DEFAULTS], next);

						delete defaults[key];

						Object.assign(host(this), defaults);

						next = {};
					});
				};

				for (const overrideKey of overrideKeys) {
					if (activeKeys.delete(overrideKey)) continue;

					const breakpoint = breakpoints[overrideKey];

					if (!breakpoint) continue;

					switch (breakpoint.type) {
						case 'container': {
							const container = containers[overrideKey];

							if (!container) break;

							const containerQueryList = matchContainer(host(this), container);

							const change = () => {
								for (const containerKey of containerKeys) {
									if (matchContainer(host(this), containers[containerKey]).matches) {
										apply(containerKey);
									}
								}
								apply();
							};

							containerQueryList.addEventListener('change', change);

							const disposer = () => {
								containerQueryList.removeEventListener('change', change);
							};

							disposers.set(overrideKey, disposer);

							if (!containerQueryList.matches) break;

							change();

							break;
						}
						case 'media': {
							const media = medias[overrideKey];

							if (!media) break;

							const mediaQueryList = window.matchMedia(media);

							const change = () => {
								for (const mediaKey of mediaKeys) {
									if (window.matchMedia(medias[mediaKey]).matches) {
										apply(mediaKey);
									}
								}
								apply();
							};

							mediaQueryList.addEventListener('change', change);

							const disposer = () => {
								mediaQueryList.removeEventListener('change', change);
							};

							disposers.set(overrideKey, disposer);

							if (!mediaQueryList.matches) break;

							change();

							break;
						}
					}
				}

				for (const activeKey of activeKeys) {
					const disposer = disposers.get(activeKey);

					disposer?.();

					disposers.delete(activeKey);
				}
			}
		);

		wrapMethod('after', target, CONSTANTS.LIFECYCLE_DISCONNECTED, function () {
			this[DISPOSERS] ??= new Map();

			const disposers = this[DISPOSERS] as DisposerMap;

			disposers.forEach((disposer) => {
				disposer();
			});

			disposers.clear();
		});
	};
}
