import type { BDUIElement } from '@bdui/core';
import type { ModalController } from '@bdui/runtime';
export interface ModalHostOptions {
    renderNode(node: BDUIElement): HTMLElement;
    lookupModal(id: string): BDUIElement | undefined;
}
export declare function mountModalHost(doc: Document, modal: ModalController, options: ModalHostOptions): () => void;
//# sourceMappingURL=modal-host.d.ts.map