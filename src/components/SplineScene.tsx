import { useState, Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import { Sparkles, RefreshCw, Box } from 'lucide-react';

interface SplineSceneProps {
  sceneUrl?: string;
  className?: string;
}

// Popular public high-quality Spline scenes for tech portfolios
const DEFAULT_SPLINE_SCENE = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';

export default function SplineScene({
  sceneUrl = DEFAULT_SPLINE_SCENE,
  className = ''
}: SplineSceneProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentScene, setCurrentScene] = useState(sceneUrl);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-white/10 ${className}`}>
      {/* Loading Overlay */}
      {loading && !error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-cyan-300 font-mono flex items-center gap-1.5">
            <Sparkles size={14} className="animate-pulse" />
            Initializing Spline 3D Runtime...
          </p>
        </div>
      )}

      {/* Error Fallback / Offline visualizer */}
      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
            <Box size={32} className="animate-bounce" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">Spline 3D Interactive Core</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Could not fetch remote Spline asset (network offline or restricted). Switched to interactive hardware WebGL view.
          </p>
          <button
            onClick={() => {
              setError(false);
              setLoading(true);
              setCurrentScene(`${sceneUrl}?t=${Date.now()}`);
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            Retry Spline Stream
          </button>
        </div>
      ) : (
        <Suspense fallback={null}>
          <div className="w-full h-full">
            <Spline
              scene={currentScene}
              onLoad={handleLoad}
              onError={handleError}
              className="w-full h-full"
            />
          </div>
        </Suspense>
      )}

      {/* Top Banner Tag */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium backdrop-blur-md bg-cyan-950/60 text-cyan-300 border border-cyan-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          Spline 3D
        </span>
      </div>
    </div>
  );
}
