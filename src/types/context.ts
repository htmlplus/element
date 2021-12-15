import { ClassBody, ClassDeclaration, ClassMethod, ClassProperty, File } from '@babel/types';

export interface Context {
    ast?: File
    attributes?: ClassBody['body'];
    component?: ClassDeclaration;
    content: string;
    directory: string;
    events: Array<ClassProperty>;
    filename: string;
    hasMount?: boolean;
    hasUnmount?: boolean;
    key?: string;
    members: ClassBody['body'];
    methods: Array<ClassMethod>;
    name?: string;
    prefix?: string;
    properties: Array<ClassProperty>;
    render?: ClassMethod;
    script?: string;
    states: Array<ClassProperty>;
    style?: string;
    styleDependencies?: Array<string>;
    styleParsed?: string;
    stylePath?: string;
    tag: string;
    title?: string;
}