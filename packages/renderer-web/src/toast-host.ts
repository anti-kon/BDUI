import type { ToastController, ToastPayload } from '@bdui/runtime';

export function mountToastHost(doc: Document, toast: ToastController): () => void {
  const host = doc.createElement('div');
  host.className = 'bdui-toast-host';
  doc.body.appendChild(host);

  const nodes = new Map<string, HTMLElement>();

  const unsubShow = toast.on('show', (payload: ToastPayload) => {
    const el = doc.createElement('div');
    el.className = `bdui-toast bdui-toast--${payload.level}`;
    el.dataset['visible'] = '0';
    el.textContent = payload.message;
    host.appendChild(el);
    nodes.set(payload.id, el);
    requestAnimationFrame?.(() => el.setAttribute('data-visible', '1'));
  });

  const unsubDismiss = toast.on('dismiss', ({ id }) => {
    const el = nodes.get(id);
    if (!el) return;
    el.setAttribute('data-visible', '0');
    const remove = () => {
      el.remove();
      nodes.delete(id);
    };
    if (typeof setTimeout === 'function') setTimeout(remove, 220);
    else remove();
  });

  return () => {
    unsubShow();
    unsubDismiss();
    host.remove();
    nodes.clear();
  };
}
