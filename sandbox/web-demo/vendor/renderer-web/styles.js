const STYLE_ELEMENT_ID = 'bdui-default-styles';
const CSS_CONTENT = `
.bdui-button {
  padding: 9px 14px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #aebccd;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  background: #ffffff;
  color: #16213a;
  font: inherit;
  font-weight: 800;
  box-shadow: none;
}

.bdui-input,
.bdui-select {
  width: 100%;
  min-height: 42px;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  font-size: 15px;
  line-height: 1.35;
  padding: 9px 12px;
  outline: none;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.bdui-select {
  cursor: pointer;
  padding-right: 36px;
}

.bdui-input::placeholder {
  color: #94a3b8;
}

.bdui-input:hover,
.bdui-select:hover {
  border-color: #94a3b8;
}

.bdui-input:focus,
.bdui-select:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
}

.bdui-input:disabled,
.bdui-select:disabled,
.bdui-input[readonly] {
  cursor: not-allowed;
  background: #f8fafc;
  color: #64748b;
}

.bdui-input[readonly] {
  cursor: default;
}

.bdui-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.bdui-button--primary {
  border-color: #0f766e;
  background: #0f766e;
  color: #ffffff;
}

.bdui-button--secondary {
  background: #ffffff;
  color: #16213a;
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
  border-radius: 4px;
  box-shadow: none;
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