declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "react" {
  export type ReactNode = any;
  export type ReactElement = any;
  export type CSSProperties = Record<string, string | number | undefined>;

  const React: any;
  export default React;
}

declare module "react/jsx-runtime" {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare module "react-dom/server" {
  export function renderToStaticMarkup(element: any): string;
}
