import type { StyleRecord } from './context';

type StyleInput = StyleRecord | StyleRecord[] | string | null | undefined;

type BaseProps<T extends HTMLElement = HTMLElement> = {
  class?: string;
  className?: string;
  style?: StyleInput;
  dataset?: Record<string, string | number | undefined>;
  children?: any;
  dangerouslySetInnerHTML?: { __html: string } | string;
  ref?: (element: T) => void;
} & Record<string, any>;

declare global {
  namespace JSX {
    type Element = HTMLElement;
    interface IntrinsicAttributes {
      key?: string | number;
    }
    interface IntrinsicElements {
      button: BaseProps<HTMLButtonElement>;
      div: BaseProps<HTMLDivElement>;
      span: BaseProps<HTMLSpanElement>;
      pre: BaseProps<HTMLPreElement>;
      [elemName: string]: BaseProps;
    }
  }
}

export {};
