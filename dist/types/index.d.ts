export interface HTMLPlusElement {
    adoptedCallback?(): void;
    connectedCallback?(): void;
    constructedCallback?(): void;
    disconnectedCallback?(): void;
    loadedCallback?(): void;
    updateCallback?(states: Map<string, any>): void;
    updatedCallback?(states: Map<string, any>): void;
}
