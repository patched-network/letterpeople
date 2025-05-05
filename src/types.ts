export interface LetterOptions {
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  lineWidth?: number;
  style?: "sans-serif" | "serif";
}

export interface point {
  x: number;
  y: number;
}

export interface LetterRender {
  svg: SVGElement;
  attachments: {
    leftEye: point;
    rightEye: point;
    leftArm: point;
    rightArm: point;
    leftLeg: point;
    rightLeg: point;
    mouth: point;
    hat: point;
  };
}
