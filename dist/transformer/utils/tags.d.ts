import t from '@babel/types';
export interface Tag {
    key?: string;
    value?: string;
}
export interface TagParsed {
    name?: string;
    description?: string;
}
export declare const getTag: (node: t.Node, key?: string) => Tag | undefined;
export declare const getTags: (node: t.Node, filter?: string) => Array<Tag>;
export declare const hasTag: (node: t.Node, name: string) => Boolean;
export declare const parseTag: (tag: Tag, spliter?: string) => TagParsed;
