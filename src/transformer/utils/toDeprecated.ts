import type { Tag } from './getTags';

export const toDeprecated = (tags: Tag[]): string | true | undefined => {
	const tag = tags.find((item) => item.name === 'deprecated');
	if (!tag) return undefined;
	return tag.description || true;
};
