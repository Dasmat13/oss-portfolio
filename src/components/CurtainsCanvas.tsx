import { useEffect, useRef, useState } from 'react';
import { Curtains, Plane } from 'curtainsjs';

interface CurtainsDistortionProps {
  imageSrc: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const vertexShader = `
  precision mediump float;
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;
  uniform mat4 uTextureMatrix0;

  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  void main() {
    vec3 vertexPosition = aVertexPosition;
    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = vertexPosition;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec3 vVertexPosition;
  varying vec2 vTextureCoord;

  uniform sampler2D uSampler0;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;

  void main() {
    vec2 coord = vTextureCoord;
    float dist = distance(coord, uMouse);
    float wave = sin(dist * 20.0 - uTime * 4.0) * 0.025 * uHover * max(0.0, 1.0 - dist * 1.8);
    
    // Chromatic dispersion displacement
    vec2 displacedCoord = coord + vec2(wave, wave);
    vec4 colR = texture2D(uSampler0, displacedCoord + vec2(wave * 0.7, 0.0));
    vec4 colG = texture2D(uSampler0, displacedCoord);
    vec4 colB = texture2D(uSampler0, displacedCoord - vec2(0.0, wave * 0.7));

    gl_FragColor = vec4(colR.r, colG.g, colB.b, colG.a);
  }
`;

export default function CurtainsCanvas({
  imageSrc,
  alt = 'Avatar',
  className = '',
  width = 110,
  height = 110
}: CurtainsDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeElementRef = useRef<HTMLDivElement>(null);
  const curtainsRef = useRef<Curtains | null>(null);
  const planeRef = useRef<Plane | null>(null);
  const [webglActive, setWebglActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !planeElementRef.current) return;

    try {
      const curtains = new Curtains({
        container: containerRef.current,
        alpha: true,
        antialias: true,
        pixelRatio: Math.min(1.5, window.devicePixelRatio || 1),
        watchScroll: false
      });
      curtainsRef.current = curtains;

      curtains.onError(() => {
        setWebglActive(false);
      });

      curtains.onContextLost(() => {
        setWebglActive(false);
      });

      const planeParams = {
        vertexShader,
        fragmentShader,
        widthSegments: 16,
        heightSegments: 16,
        uniforms: {
          time: {
            name: 'uTime',
            type: '1f',
            value: 0
          },
          mouse: {
            name: 'uMouse',
            type: '2f',
            value: [0.5, 0.5]
          },
          hover: {
            name: 'uHover',
            type: '1f',
            value: 0
          }
        }
      };

      const plane = new Plane(curtains, planeElementRef.current, planeParams);
      planeRef.current = plane;

      plane.onReady(() => {
        setWebglActive(true);
      });

      plane.onRender(() => {
        if (plane.uniforms.time) {
          plane.uniforms.time.value += 0.02;
        }
      });

      return () => {
        try {
          curtains.dispose();
        } catch {
          // cleanup
        }

      };
    } catch (err) {
      console.debug('Curtains.js WebGL initialization skipped:', err);
      setWebglActive(false);
    }
  }, [imageSrc]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!planeElementRef.current || !planeRef.current) return;
    const rect = planeElementRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (planeRef.current.uniforms.mouse) {
      planeRef.current.uniforms.mouse.value = [x, y];
    }
  };

  const handleMouseEnter = () => {
    if (planeRef.current && planeRef.current.uniforms.hover) {
      planeRef.current.uniforms.hover.value = 1.0;
    }
  };

  const handleMouseLeave = () => {
    if (planeRef.current && planeRef.current.uniforms.hover) {
      planeRef.current.uniforms.hover.value = 0.0;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`curtains-canvas-wrapper relative overflow-hidden rounded-2xl group ${className}`}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={planeElementRef}
        className="w-full h-full relative"
        style={{ width: '100%', height: '100%' }}
      >
        <img
          src={imageSrc}
          alt={alt}
          crossOrigin="anonymous"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            webglActive ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {/* Subtle indicator chip */}
      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-cyan-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-cyan-400/20">
        curtains.js
      </span>
    </div>
  );
}
