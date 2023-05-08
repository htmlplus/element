import { Node } from '@babel/types';
export interface Tag {
    key?: string;
    value?: string;
}
export interface TagParsed {
    name?: string;
    description?: string;
}
export declare const getTag: (node: Node, key?: string) => Tag | undefined;
export declare const getTags: (node: Node, filter?: string) => Array<Tag>;
export declare const hasTag: (node: Node, name: string) => Boolean;
export declare const parseTag: (tag: Tag, spliter?: string) => TagParsed;
