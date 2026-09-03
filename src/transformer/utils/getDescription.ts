import ts from 'typescript';

export const getDescription = (node: ts.Node): string => {
	return (
		ts
			.getJSDocCommentsAndTags(node)
			.find(ts.isJSDoc)
			?.comment?.toString()
			?.replaceAll('\n\n', ' ')
			?.replaceAll('\n', ' ') || ''
	);
};
