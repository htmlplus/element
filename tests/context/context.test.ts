import { afterEach, describe, expect, it } from 'vitest';

import './my-consumer';
import './my-provider-outer';
import './my-provider';

describe('Context', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('provides context value to consumer on mount', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		expect(consumer.getState()).toEqual(provider.getState());
	});

	it.skip('updates consumer state when provider state changes', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		provider.setState({ value: 11111 });

		expect(consumer.getState()).toStrictEqual({ value: 11111 });
	});

	it.skip('updates all consumers when provider state changes', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer1 = createElement('my-consumer', provider);

		const consumer2 = createElement('my-consumer', provider);

		await nextTick();

		provider.setState({ value: 11111 });

		expect(consumer1.getState()).toEqual({ value: 11111 });

		expect(consumer2.getState()).toEqual({ value: 11111 });
	});

	it('provider exposes its state', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		expect(consumer.getState()).toBeDefined();

		expect(consumer.getState()).toEqual({ value: 12345 });
	});

	it('shares the same state reference between provider and consumer', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		expect(consumer.getState()).toBe(provider.getState());
	});

	it('resolves context for deeply nested consumers', async () => {
		const provider = createElement('my-provider', document.body);

		const wrapper = createElement('div', provider);

		const consumer = createElement('my-consumer', wrapper);

		await nextTick();

		expect(consumer.getState()).toEqual(provider.getState());
	});

	it('resolves the nearest provider in the hierarchy', async () => {
		const providerOuter = createElement('my-provider', document.body);

		const provider = createElement('my-provider', providerOuter);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		expect(consumer.getState()).toEqual(provider.getState());
	});

	it('supports multiple consumers sharing the same provider', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer1 = createElement('my-consumer', provider);

		const consumer2 = createElement('my-consumer', provider);

		await nextTick();

		expect(consumer1.getState()).toEqual(provider.getState());

		expect(consumer2.getState()).toEqual(provider.getState());
	});

	it('has no state when rendered without a provider', async () => {
		const consumer = createElement('my-consumer', document.body);

		await nextTick();

		expect(consumer.getState()).toBeUndefined();
	});

	it('does not bind to a provider added as a sibling', async () => {
		const consumer = createElement('my-consumer', document.body);

		createElement('my-provider', document.body);

		await nextTick();

		expect(consumer.getState()).toBeUndefined();
	});

	it('resolves context when moved under a provider after mount', async () => {
		const consumer = createElement('my-consumer', document.body);

		await nextTick();

		expect(consumer.getState()).toBeUndefined();

		const provider = createElement('my-provider', document.body);

		provider.appendChild(consumer);

		await nextTick();

		expect(consumer.getState()).toEqual(provider.getState());
	});

	it('clears consumer state when removed from provider', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		provider.removeChild(consumer);

		expect(consumer.getState()).toBeUndefined();
	});

	it('clears consumer state when provider is removed from DOM', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		document.body.removeChild(provider);

		expect(consumer.getState()).toBeUndefined();
	});

	it('consumer rebinds when provider is reconnected', async () => {
		const provider = createElement('my-provider', document.body);

		const consumer = createElement('my-consumer', provider);

		await nextTick();

		document.body.removeChild(provider);

		await nextTick();

		document.body.appendChild(provider);

		await nextTick();

		expect(consumer.getState()).toBe(provider.getState());
	});

	it('resolves context when a provider is added before the consumer is reparented', async () => {
		const consumer = createElement('my-consumer', document.body);

		await nextTick();

		const provider = createElement('my-provider', document.body);

		await nextTick();

		provider.appendChild(consumer);

		expect(consumer.getState()).toBe(provider.getState());
	});

	it('resolves context when a consumer is added after the provider is already mounted', async () => {
		const provider = createElement('my-provider', document.body);

		await nextTick();

		const consumer = createElement('my-consumer', document.body);

		await nextTick();

		provider.appendChild(consumer);

		expect(consumer.getState()).toBe(provider.getState());
	});
});
