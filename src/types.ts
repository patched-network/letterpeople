export interface LetterOptions {
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineWidth?: number;
  style?: "sans-serif" | "serif";
}

export interface LetterRender {
  svg: SVGElement;
  attachments: {
    [key: string]: { x: number; y: number };
  };
}
