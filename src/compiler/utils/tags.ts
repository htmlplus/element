import { Node } from '@babel/types';

export interface Tag {
  key?: string;
  value?: string;
}

export interface TagParsed {
  name?: string;
  description?: string;
}

export const getTag = (node: Node, key?: string): Tag | undefined => {
  return getTags(node, key).pop();
};

export const getTags = (node: Node, filter?: string): Array<Tag> => {
  const tags: Array<Tag> = [];

  const lines = node.leadingComments
    ?.map((comment) => {
      const { type, value } = comment;
      if (type == 'CommentLine') return value;
      return value.replace(/\r\n/g, '\n').split('\n');
    })
    ?.flat()
    ?.filter((line) => line.trim().replace(/\*/g, ''))
    ?.map((line) => line.replace(/^( +)?(\*+)?( +)?/, ''));

  for (const line of lines || []) {
    const has = !!tags.length;

    const isTag = line.startsWith('@');

    if (isTag) {
      const [key, ...values] = line.split(' ');

      tags.push({
        key: key.slice(1).trim(),
        value: values.join(' ').trimStart()
      });

      continue;
    }

    if (!has) tags.push({ key: '', value: '' });

    tags[tags.length - 1].value += line;
  }

  return tags.filter((tag) => !filter || filter === tag.key);
};

export const hasTag = (node: Node, name: string): Boolean => {
  return getTags(node).some((tag) => tag.key === name);
};

export const parseTag = (tag: Tag, spliter: string = '-'): TagParsed => {
  const sections = tag.value?.split(spliter) || [];
  const name = sections[0]?.trim();
  const description = sections.slice(1).join(spliter).trim();
  return {
    name,
    description
  };
};
