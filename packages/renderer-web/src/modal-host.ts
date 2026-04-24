import type { BDUIElement } from '@bdui/core';
import type { ModalController } from '@bdui/runtime';

export interface ModalHostOptions {
  renderNode(node: BDUIElement): HTMLElement;
  lookupModal(id: string): BDUIElement | undefined;
}

export function mountModalHost(
  doc: Document,
  modal: ModalController,
  options: ModalHostOptions,
): () => void {
  const host = doc.createElement('div');
  host.setAttribute('data-bdui-modal-host', '');
  doc.body.appendChild(host);

  const activeBackdrops = new Map<string, HTMLElement>();

  function openDialog(id: string): void {
    const descriptor = options.lookupModal(id);
    if (!descriptor) {
      console.warn(`[bdui/renderer-web] Unknown modal id: ${id}`);
      return;
    }
    const backdrop = doc.createElement('div');
    backdrop.className = 'bdui-modal-backdrop';
    const dialog = doc.createElement('div');
    dialog.className = 'bdui-modal';
    dialog.appendChild(options.renderNode(descriptor));
    backdrop.appendChild(dialog);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) modal.close(id);
    });
    host.appendChild(backdrop);
    activeBackdrops.set(id, backdrop);
  }

  const unsubOpen = modal.on('open', ({ id }) => openDialog(id));
  const unsubClose = modal.on('close', ({ id }) => {
    const el = activeBackdrops.get(id);
    if (!el) return;
    el.remove();
    activeBackdrops.delete(id);
  });

  return () => {
    unsubOpen();
    unsubClose();
    for (const el of activeBackdrops.values()) el.remove();
    activeBackdrops.clear();
    host.remove();
  };
}
