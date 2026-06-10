declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': ModelViewerAttributes;
  }
}

interface ModelViewerAttributes
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  src?: string;
  alt?: string;
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  ar?: boolean;
  'ar-modes'?: string;
  'ar-placement'?: string;
  'shadow-intensity'?: string | number;
  'camera-orbit'?: string;
  'min-camera-orbit'?: string;
  'max-camera-orbit'?: string;
  'interaction-prompt'?: string;
  'interaction-prompt-threshold'?: string | number;
  loading?: string;
  reveal?: string;
  'ar-scale'?: string;
  'ios-src'?: string;
  'quick-look-browsers'?: string;
  'ar-button'?: string | boolean;
  'environment-image'?: string;
  'skybox-image'?: string;
  exposure?: string | number;
  'tone-mapping'?: string;
  poster?: string;
  'xr-environment'?: boolean;
  ref?: React.Ref<HTMLModelViewerElement>;
  style?: React.CSSProperties;
  className?: string;
  slot?: string;
  onLoad?: (event: Event) => void;
  onError?: (event: Event) => void;
}

interface HTMLModelViewerElement extends HTMLElement {
  src: string;
  alt: string;
  cameraControls: boolean;
  autoRotate: boolean;
  ar: boolean;
  arModes: string;
  arPlacement: string;
  shadowIntensity: string | number;
  canActivateAR: boolean;
  activateAR: () => void;
  jumpCameraToGoal: () => void;
  getCameraOrbit: () => string;
  getCameraTarget: () => string;
  getFieldOfView: () => number;
  setCameraOrbit: (orbit: string) => void;
  setCameraTarget: (target: string) => void;
  setFieldOfView: (fov: number) => void;
  zoom: (delta: number) => void;
  readonly loaded: boolean;
  readonly currentTime: number;
  readonly duration?: number;
  pause: () => void;
  play: () => void;
  dismissPoster: () => void;
  showPoster: () => void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLModelViewerElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
}