const STYLE_ELEMENT_ID = 'bdui-default-styles';
const CSS_CONTENT = `
.bdui-button {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: background 0.2s ease;
  background: #f3f4f6;
  color: #111827;
  font: inherit;
}

.bdui-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.bdui-button--primary {
  background: #4F46E5;
  color: #ffffff;
}

.bdui-button--secondary {
  background: #f3f4f6;
  color: #111827;
}

.bdui-row {
  display: flex;
  flex-direction: row;
}

.bdui-column {
  display: flex;
  flex-direction: column;
}

.bdui-text {
  color: inherit;
  display: inline;
}

.bdui-toast-host {
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
}

.bdui-toast {
  padding: 12px 16px;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.2s ease;
  font: inherit;
  max-width: 360px;
}

.bdui-toast[data-visible="1"] {
  opacity: 1;
  transform: translateY(0);
}

.bdui-toast--success { background: #065f46; }
.bdui-toast--warning { background: #92400e; }
.bdui-toast--error   { background: #991b1b; }

.bdui-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.bdui-modal {
  min-width: 280px;
  max-width: 90vw;
  background: #ffffff;
  color: #111827;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  padding: 20px;
}
`;
export function ensureDefaultStyles(doc) {
    if (doc.getElementById(STYLE_ELEMENT_ID))
        return;
    const style = doc.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = CSS_CONTENT;
    doc.head.appendChild(style);
}
//# sourceMappingURL=styles.js.map