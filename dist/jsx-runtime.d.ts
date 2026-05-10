import { ClassAttributes } from 'preact';
import { DOMAttributes } from 'preact';
import { FunctionComponent } from 'preact';
import { JSX as JSX_2 } from 'preact/jsx-runtime';
import { VNode } from 'preact';

export declare const Fragment: FunctionComponent<{}>;

declare type IntrinsicElementsBase = {
    [K in keyof JSX_2.IntrinsicElements]: Omit<JSX_2.IntrinsicElements[K], 'ref'>;
};

export declare namespace JSX {
    export interface IntrinsicElements extends IntrinsicElementsBase {
        host: JSX_2.IntrinsicElements['div'] & {
            value: any;
            [key: string]: unknown;
        };
    }
}

export declare function jsx(type: any, props: any, key: any): VNode< DOMAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>>;

export declare function jsxDEV(type: any, props: any, key: any, isStatic: any, source: any, self: any): VNode< DOMAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>>;

export declare function jsxs(type: any, props: any, key: any): VNode< DOMAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>>;

export { }
