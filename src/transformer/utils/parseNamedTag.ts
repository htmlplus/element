import type { Tag } from './getTags';

export const parseNamedTag = (tag: Tag): Tag => {
	const [name, description] = tag.description.split(' - ').map((section) => section.trim());
	return { name, description };
};
