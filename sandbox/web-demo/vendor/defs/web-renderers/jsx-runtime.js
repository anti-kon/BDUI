import { getWebContext } from './context.js';
function toDomChild(value) {
  if (value == null || value === false) return null;
  const context = getWebContext();
  if (Array.isArray(value)) {
    const fragment = context.document.createDocumentFragment();
    for (const child of value) {
      const domChild = toDomChild(child);
      if (domChild) fragment.appendChild(domChild);
    }
    return fragment;
  }
  const doc = context.document;
  const NodeCtor = doc.defaultView?.Node ?? globalThis.Node;
  if (value instanceof NodeCtor) {
    return value;
  }
  return doc.createTextNode(String(value));
}
function applyStyle(el, style) {
  if (!style) return;
  if (typeof style === 'string') {
    el.setAttribute('style', style);
    return;
  }
  if (Array.isArray(style)) {
    for (const part of style) applyStyle(el, part);
    return;
  }
  Object.assign(el.style, style);
}
function applyProps(el, props) {
  if (!props) return;
  const doc = getWebContext().document;
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' || value === undefined || value === null) continue;
    if (key === 'style') {
      applyStyle(el, value);
      continue;
    }
    if (key === 'class' || key === 'className') {
      el.className = String(value);
      continue;
    }
    if (key === 'dangerouslySetInnerHTML') {
      const html = typeof value === 'object' && value && '__html' in value ? value.__html : value;
      if (typeof html === 'string') el.innerHTML = html;
      continue;
    }
    if (key === 'ref' && typeof value === 'function') {
      value(el);
      continue;
    }
    if (/^on[A-Z]/.test(key) && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
      continue;
    }
    if (key === 'dataset' && value && typeof value === 'object') {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        if (dataValue != null) {
          el.dataset[dataKey] = String(dataValue);
        }
      }
      continue;
    }
    if (value === true) {
      el.setAttribute(key, '');
      continue;
    }
    if (value === false) {
      el.removeAttribute(key);
      continue;
    }
    el.setAttribute(key, String(value));
  }
  const children = props.children;
  if (children !== undefined) {
    const domChild = toDomChild(children);
    if (domChild) el.appendChild(domChild);
  }
}
function createElement(type, props) {
  if (typeof type === 'function') {
    return type(props ?? {});
  }
  const context = getWebContext();
  const el = context.document.createElement(type);
  applyProps(el, props);
  return el;
}
export function jsx(type, props, key) {
  return createElement(type, props);
}
export const jsxs = jsx;
export function Fragment(props) {
  const context = getWebContext();
  const fragment = context.document.createDocumentFragment();
  const domChild = toDomChild(props?.children);
  if (domChild) fragment.appendChild(domChild);
  return fragment;
}
