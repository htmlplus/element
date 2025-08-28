import type t from '@babel/types';

interface TagEntry {
	name: string;
	type?: string;
	description: string;
}

type ExtractedResult = {
	description: string;
	[key: string]: string | boolean | TagEntry[] | undefined;
};

export const extractFromComment = (node: t.Node, whitelist?: string[]): ExtractedResult => {
	const normalized: string[] = [];

	const result: ExtractedResult = {
		description: ''
	};

	const lines = node.leadingComments
		?.flatMap((comment) => {
			if (comment.type === 'CommentLine') {
				return comment.value;
			}
			return comment.value.split('\n');
		})
		?.map((line) => line.trim().replace(/^\*/, '').trim())
		?.filter((line) => line.trim());

	for (const line of lines || []) {
		if (line.startsWith('@')) {
			normalized.push(line);
			continue;
		}

		if (!normalized.length) normalized.push('');

		normalized[normalized.length - 1] += ` ${line}`;
	}

	for (const line of normalized) {
		if (!line.startsWith('@')) {
			result.description = line.trim();
			continue;
		}

		const regex = /@(\w+)(?:\s*({\w+})\s*)?(?:\s*([-a-zA-Z\s]+)\s*-\s*)?(.*)/;

		const groups = regex.exec(line);

		if (!groups) continue;

		const tag = groups[1]?.trim();
		const type = groups[2]?.trim().slice(1, -1);
		const name = groups[3]?.trim();
		const description = groups[4]?.trim();

		// TODO
		// const [, tag, type, name, description] = groups.map((g) => g?.trim() || '');

		if (name && description) {
			const key = `${tag}s`;

			if (whitelist && !whitelist.includes(key)) continue;

			result[key] ||= [];

			(result[key] as TagEntry[]).push({ name, type, description });
		} else {
			const key = tag;

			if (whitelist && !whitelist.includes(key)) continue;

			result[key] = description || true;
		}
	}

	return result;
};
