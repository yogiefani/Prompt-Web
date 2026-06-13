import * as React from "react";

type PhantomUIProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
  loading?: boolean | string;
  animation?: string;
  "shimmer-direction"?: string;
  "shimmer-color"?: string;
  "background-color"?: string;
  duration?: number | string;
  stagger?: number | string;
  reveal?: number | string;
  count?: number | string;
  "count-gap"?: number | string;
  "fallback-radius"?: number | string;
  debug?: boolean | string;
  "loading-label"?: string;
  "pierce-shadow"?: boolean | string;
}, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUIProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUIProps;
    }
  }
}
