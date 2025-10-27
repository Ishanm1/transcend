import { useState, useEffect, useRef } from 'react';

export const useBreathCycle = (isActive) => {
  const [breathPhase, setBreathPhase] = useState('exhale'); // 'exhale', 'inhale', 'rest'
  const [breathProgress, setBreathProgress] = useState(0); // 0-1 progress through current phase
  const [glowIntensity, setGlowIntensity] = useState(0); // For pulsing effect during exhale
  
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const currentPhaseRef = useRef('exhale');
  const phaseStartRef = useRef(0);

  // Breathing cycle timing (matches BreathingCircle.js precisely)
  const EXHALE_DURATION = 8040; // 8.04 seconds
  const INHALE_DURATION = 6960; // 6.96 seconds
  const REST_DURATION = 1500; // 1.5 seconds
  const TOTAL_CYCLE = EXHALE_DURATION + INHALE_DURATION + REST_DURATION;

  useEffect(() => {
    if (!isActive) {
      // Reset when not active
      setBreathPhase('exhale');
      setBreathProgress(0);
      setGlowIntensity(0);
      startTimeRef.current = null;
      currentPhaseRef.current = 'exhale';
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        phaseStartRef.current = timestamp;
      }

      const cycleElapsed = (timestamp - startTimeRef.current) % TOTAL_CYCLE;
      
      if (cycleElapsed < EXHALE_DURATION) {
        // Exhale phase
        if (currentPhaseRef.current !== 'exhale') {
          currentPhaseRef.current = 'exhale';
          phaseStartRef.current = timestamp;
        }
        const progress = cycleElapsed / EXHALE_DURATION;
        setBreathPhase('exhale');
        setBreathProgress(progress);
        
        // Pulsing glow during exhale (completes ~4 pulses during 8.04s)
        const pulseProgress = (cycleElapsed % 2000) / 2000;
        setGlowIntensity(0.3 + Math.sin(pulseProgress * Math.PI * 2) * 0.4);
        
      } else if (cycleElapsed < EXHALE_DURATION + INHALE_DURATION) {
        // Inhale phase
        if (currentPhaseRef.current !== 'inhale') {
          currentPhaseRef.current = 'inhale';
          phaseStartRef.current = timestamp;
        }
        const progress = (cycleElapsed - EXHALE_DURATION) / INHALE_DURATION;
        setBreathPhase('inhale');
        setBreathProgress(progress);
        setGlowIntensity(0); // No glow during inhale
        
      } else {
        // Rest phase
        if (currentPhaseRef.current !== 'rest') {
          currentPhaseRef.current = 'rest';
          phaseStartRef.current = timestamp;
        }
        const progress = (cycleElapsed - EXHALE_DURATION - INHALE_DURATION) / REST_DURATION;
        setBreathPhase('rest');
        setBreathProgress(progress);
        setGlowIntensity(0);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  return { breathPhase, breathProgress, glowIntensity };
};

