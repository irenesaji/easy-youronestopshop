'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import '@google/model-viewer';

interface ModelViewerARProps {
  /** URL to the .glb model */
  glbUrl: string;
  /** Optional alt text for accessibility */
  alt?: string;
  /** Placement mode for AR: 'floor' | 'wall' | 'none' */
  arPlacement?: 'floor' | 'wall' | 'none';
  /** Camera orbit on load (e.g. "0deg 75deg 3m") */
  cameraOrbit?: string;
  /** Shadow intensity */
  shadowIntensity?: string | number;
  /** Enable auto-rotate in 3D viewer */
  autoRotate?: boolean;
  /** AR scale: 'auto' | 'fixed' */
  arScale?: 'auto' | 'fixed';
  /** iOS AR Quick Look (USDZ) path if different from GLB */
  iosSrc?: string;
  /** Optional poster image */
  poster?: string;
  /** Additional CSS class names */
  className?: string;
  /** Viewer container height */
  height?: string | number;
  /** Called when model loads */
  onLoad?: () => void;
  /** Called when AR is activated */
  onArActivated?: () => void;
  /** Called when AR is not supported */
  onArNotSupported?: () => void;
  /** Enable environment lighting */
  environmentImage?: string;
}

/**
 * ModelViewerAR — Production-ready React component for .glb 3D models
 * with full Augmented Reality support.
 *
 * AR Modes (in order of priority):
 * 1. WebXR immersive-ar — Best experience, surface detection, placement
 * 2. Scene Viewer (Android) — Opens Google's 3D viewer app
 * 3. AR Quick Look (iOS) — Native iOS AR experience
 *
 * Usage:
 * ```tsx
 * <ModelViewerAR glbUrl="/models/my-model.glb" />
 * ```
 *
 * To use a product page with dynamic model:
 * ```tsx
 * <ModelViewerAR glbUrl={product.glbUrl} alt={product.name} />
 * ```
 */
export default function ModelViewerAR({
  glbUrl,
  alt = '3D Model',
  arPlacement = 'floor',
  cameraOrbit = '0deg 75deg 3m',
  shadowIntensity = '1',
  autoRotate = true,
  arScale = 'auto',
  iosSrc,
  poster,
  className = '',
  height = '500px',
  environmentImage,
  onLoad,
  onArActivated,
  onArNotSupported,
}: ModelViewerARProps) {
  const modelViewerRef = useRef<HTMLModelViewerElement>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [arActive, setArActive] = useState(false);

  // Ensure we're on client-side (Next.js SSR safe)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check WebXR AR support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkArSupport = async () => {
      // Check WebXR 'immersive-ar' support first (best AR mode)
      if (navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          if (supported) {
            console.log('[ModelViewerAR] WebXR immersive-ar is supported');
            setArSupported(true);
            return;
          }
        } catch (e) {
          console.warn('[ModelViewerAR] WebXR check failed:', e);
        }
      }

      // On iOS Safari, check for Quick Look support
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (isIOS) {
        // iOS 12+ supports AR Quick Look
        console.log('[ModelViewerAR] iOS detected, AR Quick Look should work');
        setArSupported(true);
        return;
      }

      // Check for Scene Viewer on Android
      const isAndroid = /Android/.test(navigator.userAgent);
      if (isAndroid) {
        // Most Android Chrome browsers support Scene Viewer
        console.log('[ModelViewerAR] Android detected, Scene Viewer should work');
        setArSupported(true);
        return;
      }

      // Default: unknown, will check model-viewer's canActivateAR after load
      setArSupported(null);
    };

    checkArSupport();
  }, []);

  // Handle model load
  const handleModelLoad = useCallback(() => {
    setModelLoaded(true);
    setError(null);

    // Check AR support via model-viewer's canActivateAR after model loads
    const mv = modelViewerRef.current;
    if (mv) {
      // canActivateAR returns true if the current browser supports AR
      const canAR = mv.canActivateAR;
      console.log('[ModelViewerAR] canActivateAR:', canAR);
      setArSupported(canAR);
      if (!canAR) {
        onArNotSupported?.();
      }
    }

    onLoad?.();
  }, [onLoad, onArNotSupported]);

  // Handle model error
  const handleModelError = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail;
    const errorMsg = detail?.type || detail?.message || 'Failed to load 3D model';
    console.error('[ModelViewerAR] Model error:', errorMsg);
    setError(errorMsg);
  }, []);

  // Activate AR via model-viewer's built-in activateAR()
  const activateAR = useCallback(() => {
    const mv = modelViewerRef.current;
    if (!mv) {
      setError('Model viewer not initialized. Please try again.');
      return;
    }

    // Even if canActivateAR is false, we still try — some browsers support
    // AR via Scene Viewer / Quick Look without WebXR
    try {
      console.log('[ModelViewerAR] Calling activateAR()...');
      mv.activateAR();
      setArActive(true);
      onArActivated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to launch AR';
      console.error('[ModelViewerAR] activateAR failed:', message);
      
      // Provide specific guidance based on browser
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        setError('AR could not be launched. Please make sure you are using Safari on iOS 12+ and that the model is accessible via HTTPS.');
      } else if (isAndroid) {
        setError('AR could not be launched via Scene Viewer. Please ensure Google AR services are installed and try again.');
      } else {
        setError('AR is not supported on this browser. Please try on Chrome (Android) or Safari (iOS).');
      }
      onArNotSupported?.();
    }
  }, [onArActivated, onArNotSupported]);

  // Handle AR button click
  const handleArButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    activateAR();
  }, [activateAR]);

  // Reset model URL when glbUrl changes
  useEffect(() => {
    setModelLoaded(false);
    setError(null);
    setArActive(false);
  }, [glbUrl]);

  // Determine if we should show the AR button
  const showArButton = modelLoaded && arSupported !== false;

  if (!isClient) {
    // SSR placeholder
    return (
      <div
        className={`model-viewer-ar-container ${className}`}
        style={{ height, background: '#1a1a2e', borderRadius: '12px' }}
        aria-label="3D model viewer loading"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#94a3b8',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading 3D Viewer…
        </div>
      </div>
    );
  }

  return (
    <div
      className={`model-viewer-ar-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #0c2a46 0%, #103a56 100%)',
        boxShadow: '0 12px 40px rgba(7,18,40,0.45)',
      }}
    >
      {/* 
        Model Viewer with full AR configuration.
        
        Key AR attributes:
        - ar: Enables AR mode
        - ar-modes: Comma-separated priority list:
          "webxr" -> WebXR immersive-ar (best, surface detection)
          "scene-viewer" -> Android Scene Viewer (fallback)
          "quick-look" -> iOS Quick Look (fallback)
        - ar-placement: Where to place the model ("floor" | "wall" | "none")
        - ar-scale: How scaling works in AR ("auto" | "fixed")
        - ios-src: For iOS Quick Look, can point to a USDZ version
        - ar-button: Slot for the AR button (renders natively inside model-viewer)
        - environment-image: HDR environment for realistic reflections
        - interaction-prompt: When to show the interaction prompt
        - xr-environment: Enables XR environment features
      */}
      <model-viewer
        ref={modelViewerRef as any}
        src={glbUrl}
        alt={alt}
        camera-controls
        auto-rotate={autoRotate}
        ar={true}
        ar-modes="webxr scene-viewer quick-look"
        ar-placement={arPlacement}
        ar-scale={arScale}
        shadow-intensity={String(shadowIntensity)}
        camera-orbit={cameraOrbit}
        ios-src={iosSrc || ''}
        environment-image={environmentImage || ''}
        loading="eager"
        reveal={modelLoaded ? 'auto' : 'manual'}
        interaction-prompt="auto"
        interaction-prompt-threshold="30"
        poster={poster || ''}
        xr-environment
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: 'transparent',
        }}
        onLoad={handleModelLoad}
        onError={handleModelError}
      >
        {/* AR Button rendered as slot — this ensures proper integration
            with model-viewer's internal AR activation pipeline.
            The button ONLY shows when the browser supports AR mode
            (model-viewer handles the visibility internally). */}
        <button
          slot="ar-button"
          onClick={handleArButtonClick}
          aria-label="View in augmented reality"
          title="View in your space (AR)"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1f7bff 0%, #4aa3ff 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            zIndex: 100,
            display: showArButton ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(31, 123, 255, 0.4), 0 0 0 4px rgba(31, 123, 255, 0.1)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: 0,
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 123, 255, 0.5), 0 0 0 6px rgba(31, 123, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(31, 123, 255, 0.4), 0 0 0 4px rgba(31, 123, 255, 0.1)';
          }}
        >
          {/* 3D/AR Camera Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </button>

        {/* Fallback content for browsers that don't support model-viewer at all */}
        <div
          slot="fallback"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            ⚠️
          </div>
          <p style={{ fontSize: '18px', marginBottom: '8px', fontWeight: 600 }}>
            3D viewer not supported
          </p>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Please use a modern browser like Chrome, Safari, or Edge to view this model.
          </p>
        </div>
      </model-viewer>

      {/* Loading overlay */}
      {!modelLoaded && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(12, 42, 70, 0.85)',
            color: '#e2e8f0',
            zIndex: 10,
            gap: '16px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTopColor: '#1f7bff',
              borderRadius: '50%',
              animation: 'ar-spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            Loading 3D Model…
          </span>
          <span style={{ fontSize: '12px', opacity: 0.6 }}>
            Please wait while the model loads
          </span>
          <style>{`@keyframes ar-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error message banner */}
      {error && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            background: 'rgba(220, 38, 38, 0.92)',
            color: 'white',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            zIndex: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            ✕
          </button>
        </div>
      )}

      {/* AR unsupported notification */}
      {arSupported === false && modelLoaded && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#e2e8f0',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'system-ui, sans-serif',
            zIndex: 100,
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            lineHeight: 1.4,
          }}
        >
          <span style={{ display: 'block', marginBottom: '2px' }}>
            📱 AR is not supported on this device
          </span>
          <span style={{ opacity: 0.7, fontSize: '12px' }}>
            Try on Chrome (Android) or Safari (iOS) for AR
          </span>
        </div>
      )}
    </div>
  );
}