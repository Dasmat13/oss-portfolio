declare module 'curtainsjs' {
  export class Curtains {
    constructor(params?: {
      container?: HTMLElement | string;
      alpha?: boolean;
      antialias?: boolean;
      premultipliedAlpha?: boolean;
      depth?: boolean;
      autoRender?: boolean;
      autoResize?: boolean;
      pixelRatio?: number;
      renderingScale?: number;
      production?: boolean;
      watchScroll?: boolean;
    });
    container: HTMLElement;
    gl: WebGLRenderingContext | null;
    planes: Plane[];
    render(): void;
    resize(): void;
    dispose(): void;
    onRender(callback: () => void): this;
    onError(callback: () => void): this;
    onContextLost(callback: () => void): this;
    getBoundingRect(): DOMRect;
  }

  export interface PlaneParams {
    vertexShader?: string;
    fragmentShader?: string;
    widthSegments?: number;
    heightSegments?: number;
    mimap?: boolean;
    uniforms?: Record<string, { name: string; type: string; value: any }>;
    autoloadSources?: boolean;
  }

  export class Plane {
    constructor(curtains: Curtains, htmlElement: HTMLElement | Element, params?: PlaneParams);
    htmlElement: HTMLElement;
    uniforms: Record<string, { name: string; type: string; value: any }>;
    textures: any[];
    onRender(callback: () => void): this;
    onReady(callback: () => void): this;
    onError(callback: () => void): this;
    onLeaveView(callback: () => void): this;
    onReEnterView(callback: () => void): this;
    mouseToPlaneCoords(mousePos: { x: number; y: number }): { x: number; y: number };
    play(): void;
    pause(): void;
    resetPlanes(): void;
    updatePosition(): void;
    setPerspective(fov?: number, near?: number, far?: number): void;
    setRotation(x: number, y: number, z: number): void;
    setRelativePosition(x: number, y: number): void;
    setScale(scaleX: number, scaleY: number): void;
  }

  export class Vec2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    set(x: number, y: number): this;
  }

  export class Vec3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
  }
}
