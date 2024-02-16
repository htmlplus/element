/**
 * TODO
 */
export interface Config {
    event?: {
        resolver?: (parameters: any) => CustomEvent | undefined;
    };
    asset?: {
        [key: string]: any;
    };
    element?: {
        [key: string]: {
            property?: {
                [key: string]: any;
            };
        };
    };
}
/**
 * TODO
 */
export interface ConfigOptions {
    /**
     * TODO
     */
    force?: boolean;
    /**
     * TODO
     */
    override?: boolean;
}
/**
 * TODO
 */
export declare const getConfig: (...keys: string[]) => any;
/**
 * TODO
 */
export declare const setConfig: (config: Config, options?: ConfigOptions) => void;
