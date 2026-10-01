import { getProject, types } from '@theatre/core';

// Initialize Theatre.js project for portfolio cinematic timeline
export const theatreProject = getProject('OSSPortfolio', {
  state: {
    sheetsById: {
      HeroTimeline: {
        staticOverridesByObject: {
          camera: {
            zoom: 1,
            rotationY: 0,
            distortion: 0
          },
          lighting: {
            intensity: 1.5,
            coreGlow: 2.0
          },
          heroText: {
            opacity: 1,
            yOffset: 0
          }
        }
      }
    }
  }
});

export const heroSheet = theatreProject.sheet('HeroTimeline');

export const cameraObj = heroSheet.object('camera', {
  zoom: types.number(1, { range: [0.5, 3] }),
  rotationY: types.number(0, { range: [-Math.PI, Math.PI] }),
  distortion: types.number(0, { range: [0, 1] })
});

export const lightingObj = heroSheet.object('lighting', {
  intensity: types.number(1.5, { range: [0, 5] }),
  coreGlow: types.number(2.0, { range: [0, 10] })
});

export const heroTextObj = heroSheet.object('heroText', {
  opacity: types.number(1, { range: [0, 1] }),
  yOffset: types.number(0, { range: [-100, 100] })
});

export function playHeroSequence(onComplete?: () => void) {
  try {
    heroSheet.sequence.play({ iterationCount: 1, rate: 1 }).then(() => {
      if (onComplete) onComplete();
    }).catch(() => {
      // Graceful fallback if sequence is empty or interrupted
      if (onComplete) onComplete();
    });
  } catch (err) {
    console.debug('Theatre.js sequence error:', err);
    if (onComplete) onComplete();
  }
}
