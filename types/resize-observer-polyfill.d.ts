declare module 'resize-observer-polyfill' {
  interface ResizeObserver {
    new(callback: ResizeObserverCallback): ResizeObserver;
    observe: (target: Element) => void;
    unobserve: (target: Element) => void;
    disconnect: () => void;
  }

  interface ResizeObserverCallback {
    (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
  }

  interface ResizeObserverEntry {
    new(target: Element): void;
    readonly target: Element;
    readonly contentRect: DOMRectReadOnly;
  }

  interface DOMRectReadOnly {
    fromRect(other: DOMRectInit | undefined): DOMRectReadOnly;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
    toJSON: () => any;
  }
  const resizeObserver: ResizeObserver;
  export default resizeObserver;
}