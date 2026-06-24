export interface FocusSnapshot {
    readonly index: number;
    readonly selectionStart?: number | null;
    readonly selectionEnd?: number | null;
}
export declare function focusableElements(container: HTMLElement): HTMLElement[];
export declare function captureFocus(doc: Document, container: HTMLElement): FocusSnapshot | null;
export declare function restoreFocus(container: HTMLElement, snapshot: FocusSnapshot | null): void;
//# sourceMappingURL=focus.d.ts.map