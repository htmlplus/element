import { Context, Plugin } from '../../types';
export declare const DOCUMENT_OPTIONS: Partial<DocumentOptions>;
export interface DocumentOptions {
    destination: string;
    transformer?: (context: Context, element: any) => any;
}
export declare const document: (options: DocumentOptions) => Plugin;
