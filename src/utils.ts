export function $(selector: string, scope = document) {
  return scope.querySelector(selector);
}

export function $$(selector: string, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<HTMLElementTagNameMap[K]> = {},
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    (el as any)[k] = v;
  });
  return el;
}

export function remove(el: HTMLElement | Element) {
  el.remove();
}

export function append(p: HTMLElement, c: HTMLElement) {
  p.append(c);
}

export function css(
  el: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
): void {
  Object.assign(el.style, styles);
}

export function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  ev: K,
  fn: (this: HTMLElement, e: HTMLElementEventMap[K]) => void,
  opts?: boolean | AddEventListenerOptions,
): void {
  el.addEventListener(ev, fn as EventListener, opts);
}

export function html(el: Element): string;
export function html(el: Element, value: string): void;
export function html(el: Element, value?: string) {
  if (value === undefined) return el.innerHTML;
  el.innerHTML = value;
}

export function text(el: Node): string | null;
export function text(el: Node, value: string): void;
export function text(el: Node, value?: string) {
  if (value === undefined) return el.textContent;
  el.textContent = value;
}
