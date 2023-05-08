export interface QueueOptions {
    canStart?: () => boolean;
    canRun?: () => boolean;
    run: () => void;
}
export declare const task: (options: QueueOptions) => () => Promise<boolean>;
