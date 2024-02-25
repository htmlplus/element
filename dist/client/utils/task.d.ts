export interface QueueOptions {
    canStart?: () => boolean;
    canRun?: () => boolean;
    handler: () => void;
}
export declare const task: (options: QueueOptions) => () => Promise<boolean>;
