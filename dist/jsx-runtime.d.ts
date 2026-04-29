import * as preact from 'preact';
import { JSX } from 'preact/jsx-runtime';

type IntrinsicElementsBase = {
    [K in keyof JSX.IntrinsicElements]: Omit<JSX.IntrinsicElements[K], 'ref'>;
};
declare global {
    namespace JSX {
        interface IntrinsicElements extends IntrinsicElementsBase {
            host: JSX.IntrinsicElements['div'] & {
                value: any;
                [key: string]: unknown;
            };
        }
    }
}
declare const Fragment: preact.FunctionComponent<{}>;
declare function jsx(type: any, props: any, key: any): preact.VNode<preact.DOMAttributes<HTMLInputElement> & preact.ClassAttributes<HTMLInputElement>>;
declare function jsxs(type: any, props: any, key: any): preact.VNode<preact.DOMAttributes<HTMLInputElement> & preact.ClassAttributes<HTMLInputElement>>;
declare function jsxDEV(type: any, props: any, key: any, isStatic: any, source: any, self: any): preact.VNode<preact.DOMAttributes<HTMLInputElement> & preact.ClassAttributes<HTMLInputElement>>;

export { Fragment, jsx, jsxDEV, jsxs };
