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

.bdui-button[data-state="loading"] {
  position: relative;
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
`;

export function ensureDefaultStyles(doc: Document) {
  if (doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = CSS_CONTENT;
  doc.head.appendChild(style);
}
