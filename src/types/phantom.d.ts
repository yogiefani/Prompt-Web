declare namespace JSX {
  interface IntrinsicElements {
    "phantom-ui": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
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
  }
}
