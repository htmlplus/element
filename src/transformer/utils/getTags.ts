import ts from 'typescript';

export type Tag = {
	name: string;
	description: string;
};

export const getTags = <T = Tag>(
	node: ts.Node,
	filter?: string | string[],
	transform?: (tag: Tag) => T
): T[] => {
	const filters = [filter].flat().filter(Boolean) as string[];

	const excludes = filters.filter((name) => name.startsWith('!')).map((name) => name.slice(1));

	const includes = filters.filter((name) => !name.startsWith('!'));

	return ts
		.getJSDocTags(node)
		.filter((tag) => {
			const name = tag.tagName.text;
			if (excludes.includes(name)) return false;
			if (includes.length) return includes.includes(name);
			return true;
		})
		.map((tag) => {
			const result: Tag = {
				name: tag.tagName.text,
				description: (tag.comment?.toString() ?? '').replace(/\s+/g, ' ')
			};
			return (transform ? transform(result) : result) as T;
		});
};
