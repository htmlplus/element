/**
 * TODO
 */
export interface Config {
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
export declare const getConfig: (namespace: string) => (...keys: string[]) => any;
/**
 * TODO
 */
export declare const setConfig: (namespace: string) => (config: Config, options?: ConfigOptions) => void;
