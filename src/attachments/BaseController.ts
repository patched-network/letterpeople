// letterpeople/src/attachments/BaseController.ts

import { animate, JSAnimation, AnimationParams } from "animejs";
import type { BaseAttachment, attachmentTypes } from "./types";

const DEFAULT_ANIMATION_DURATION = 250;
const DEFAULT_ANIMATION_EASE = "inOutQuad";

export class BaseController implements BaseAttachment {
  public readonly element: SVGGElement;
  public readonly type: attachmentTypes;

  protected _currentAnimation: JSAnimation | null = null;
  protected _isVisibleState: boolean = true;

  constructor(element: SVGGElement, type: attachmentTypes) {
    this.element = element;
    this.type = type;

    // Initialize _isVisibleState based on the element's current inline styles
    // This aligns with how show/hide will manipulate these styles.
    const currentOpacity = this.element.style.opacity;
    const currentDisplay = this.element.style.display;

    if (currentDisplay === "none" || currentOpacity === "0") {
      this._isVisibleState = false;
      // Ensure consistency if inferred as hidden
      if (this.element.style.display !== "none") {
        this.element.style.display = "none";
      }
      if (this.element.style.opacity !== "0") {
        this.element.style.opacity = "0";
      }
    } else {
      this._isVisibleState = true;
      // Ensure consistency if inferred as visible (and not already styled)
      if (this.element.style.display === "none") {
        this.element.style.display = "";
      }
      // If opacity is not set, we assume it's effectively 1 for a visible element.
      // No need to force it to "1" here, as animations will handle it.
    }
  }

  async show(options?: AnimationParams): Promise<void> {
    this.stopAnimations();
    this._isVisibleState = true;
    this.element.style.display = ""; // Make it part of the layout flow immediately

    const animParams: AnimationParams = {
      duration: DEFAULT_ANIMATION_DURATION,
      ease: DEFAULT_ANIMATION_EASE,
      ...options, // User options override defaults
      opacity: 1, // Target opacity
    };

    if (animParams.duration) {
      // If element's current opacity (inline or computed) is already the target,
      // anime.js might optimize, or it will run a 0-change animation.
      // For simplicity, we always attempt the animation.
      this._currentAnimation = animate(this.element, animParams);
      return this._currentAnimation.then(() => {
        this._currentAnimation = null;
      });
    } else {
      this.element.style.opacity = "1";
      return Promise.resolve();
    }
  }

  async hide(options?: AnimationParams): Promise<void> {
    this.stopAnimations();
    this._isVisibleState = false; // Set intended state

    const animParams: AnimationParams = {
      duration: DEFAULT_ANIMATION_DURATION,
      ease: DEFAULT_ANIMATION_EASE,
      ...options, // User options override defaults
      opacity: 0, // Target opacity
    };

    if (animParams.duration) {
      this._currentAnimation = animate(this.element, animParams);
      return this._currentAnimation.then(() => {
        this._currentAnimation = null;
        // Set display to none only if it's still meant to be hidden
        if (!this._isVisibleState) {
          this.element.style.display = "none";
        }
      });
    } else {
      this.element.style.opacity = "0";
      this.element.style.display = "none";
      return Promise.resolve();
    }
  }

  isVisible(): boolean {
    // Check both our intended state and the actual display style
    return this._isVisibleState && this.element.style.display !== "none";
  }

  isAnimating(): boolean {
    return this._currentAnimation !== null && !this._currentAnimation.completed;
  }

  stopAnimations(): void {
    if (this._currentAnimation) {
      this._currentAnimation.cancel(); // cancel() stops the animation and removes it from the engine.
      this._currentAnimation = null;
    }
  }

  toString(): string {
    return `${this.constructor.name} (type: ${this.type}): visible=${this.isVisible()}, animating=${this.isAnimating()}`;
  }
}
