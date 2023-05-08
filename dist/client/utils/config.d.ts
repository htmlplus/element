export interface Config {
    asset?: {
        [key: string]: any;
    };
    component?: {
        [key: string]: {
            property?: {
                [key: string]: any;
            };
        };
    };
}
export declare const getConfig: (namespace: string, ...parameters: string[]) => any;
export declare const setConfig: (namespace: string, config: Config, override?: boolean) => void;
