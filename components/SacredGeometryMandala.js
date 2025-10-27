import React, { useRef } from 'react';
import { View, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { G, Ellipse, Circle, Defs, LinearGradient, Stop, RadialGradient, Filter, FeGaussianBlur, FeMerge, FeMergeNode } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';

const { width } = Dimensions.get('window');

const SacredGeometryMandala = ({ 
  breathPhase = 'exhale',
  breathProgress = 0,
  glowIntensity = 0,
  isActive = false,
  onStart,
  onStop,
  isHapticsEnabled = true,
  onThemeToggle,
  currentTheme = 'thousandPetals',
  isMuted = false,
  onMuteToggle
}) => {
  const size = width * 0.75; // Match BreathingCircle size
  const lastPhaseRef = useRef(breathPhase);

  // Haptic control functions (matching BreathingCircle)
  const triggerHaptic = (type) => {
    if (!isHapticsEnabled) return;
    
    try {
      switch (type) {
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'notification':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Error triggering haptic:', error);
    }
  };

  // Track when we've fired haptics for each progress threshold
  const firedHapticsRef = useRef({
    exhale: { 0: false, 0.25: false, 0.5: false, 0.75: false },
    inhale: { 0: false, 0.05: false, 0.33: false, 0.66: false, 0.95: false },
    rest: { 0: false }
  });

  // Reset haptic tracking when phase changes
  React.useEffect(() => {
    if (breathPhase !== lastPhaseRef.current) {
      // Reset all flags for the new phase
      firedHapticsRef.current = {
        exhale: { 0: false, 0.25: false, 0.5: false, 0.75: false },
        inhale: { 0: false, 0.05: false, 0.33: false, 0.66: false, 0.95: false },
        rest: { 0: false }
      };
      lastPhaseRef.current = breathPhase;
    }
  }, [breathPhase]);

  // Trigger haptics based on breath progress during each phase
  React.useEffect(() => {
    if (!isActive || !isHapticsEnabled) return;

    if (breathPhase === 'exhale') {
      if (breathProgress >= 0 && !firedHapticsRef.current.exhale[0]) {
        triggerHaptic('heavy');
        firedHapticsRef.current.exhale[0] = true;
      } else if (breathProgress >= 0.25 && !firedHapticsRef.current.exhale[0.25]) {
        triggerHaptic('heavy');
        firedHapticsRef.current.exhale[0.25] = true;
      } else if (breathProgress >= 0.5 && !firedHapticsRef.current.exhale[0.5]) {
        triggerHaptic('medium');
        firedHapticsRef.current.exhale[0.5] = true;
      } else if (breathProgress >= 0.75 && !firedHapticsRef.current.exhale[0.75]) {
        triggerHaptic('light');
        firedHapticsRef.current.exhale[0.75] = true;
      }
    } else if (breathPhase === 'inhale') {
      if (breathProgress >= 0 && !firedHapticsRef.current.inhale[0]) {
        triggerHaptic('notification');
        firedHapticsRef.current.inhale[0] = true;
      } else if (breathProgress >= 0.05 && !firedHapticsRef.current.inhale[0.05]) {
        triggerHaptic('light');
        firedHapticsRef.current.inhale[0.05] = true;
      } else if (breathProgress >= 0.33 && !firedHapticsRef.current.inhale[0.33]) {
        triggerHaptic('medium');
        firedHapticsRef.current.inhale[0.33] = true;
      } else if (breathProgress >= 0.66 && !firedHapticsRef.current.inhale[0.66]) {
        triggerHaptic('heavy');
        firedHapticsRef.current.inhale[0.66] = true;
      } else if (breathProgress >= 0.95 && !firedHapticsRef.current.inhale[0.95]) {
        triggerHaptic('heavy');
        firedHapticsRef.current.inhale[0.95] = true;
      }
    } else if (breathPhase === 'rest') {
      if (breathProgress >= 0 && !firedHapticsRef.current.rest[0]) {
        triggerHaptic('notification');
        firedHapticsRef.current.rest[0] = true;
      }
    }
  }, [breathPhase, breathProgress, isActive, isHapticsEnabled]);

  const handlePressIn = () => {
    if (!isActive && onStart) {
      onStart();
    }
  };

  const handlePressOut = () => {
    if (isActive && onStop) {
      onStop();
    }
  };

  // Easing function for natural breathing feel
  const easeInOutCubic = (t) => {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const easeOutQuart = (t) => {
    return 1 - Math.pow(1 - t, 4);
  };

  const easeInQuart = (t) => {
    return t * t * t * t;
  };

  // Calculate scale for each ring based on breath phase and progress
  const getScaleValues = () => {
    let baseScale;
    
    if (breathPhase === 'exhale') {
      // Contract during exhale with ease-in (starts slow, speeds up)
      const easedProgress = easeInQuart(breathProgress);
      baseScale = 1 - easedProgress;
    } else if (breathPhase === 'inhale') {
      // Expand during inhale with ease-out (starts fast, slows down)
      const easedProgress = easeOutQuart(breathProgress);
      baseScale = easedProgress;
    } else {
      // Hold at full during rest with smooth transition
      const easedProgress = easeInOutCubic(breathProgress);
      baseScale = 1 - (easedProgress * 0.02); // Slight relaxation during rest
    }

    // Each ring contracts/expands at different rates (outer more dramatic, inner subtle)
    // This creates a wave-like breathing effect from outside to center
    return {
      outer48: 0.70 + (baseScale * 0.30),    // Ranges from 0.70 to 1.0 (most dramatic)
      second32: 0.76 + (baseScale * 0.24),   // Ranges from 0.76 to 1.0
      third24: 0.82 + (baseScale * 0.18),    // Ranges from 0.82 to 1.0
      fourth16: 0.86 + (baseScale * 0.14),   // Ranges from 0.86 to 1.0
      inner8: 0.90 + (baseScale * 0.10),     // Ranges from 0.90 to 1.0
      center: 0.94 + (baseScale * 0.06),     // Ranges from 0.94 to 1.0 (most subtle)
    };
  };

  const scaleValues = getScaleValues();

  // Calculate opacity modulation for breathing effect
  const getOpacity = (baseOpacity) => {
    if (breathPhase === 'exhale') {
      // Subtle pulsing during exhale
      const pulse = glowIntensity * 0.15;
      return Math.min(1.0, baseOpacity + pulse);
    } else if (breathPhase === 'inhale') {
      // Brighten slightly during inhale
      const brighten = breathProgress * 0.1;
      return Math.min(1.0, baseOpacity + brighten);
    }
    return baseOpacity;
  };

  // Render the Thousand Petals pattern
  const renderThousandPetals = () => {
    const center = size / 2;
    const viewBoxSize = 400;
    const scale = viewBoxSize / size;
    
    return (
      <G>
        {/* Outer mandala ring - 48 petals with breath animation */}
        {[...Array(48)].map((_, i) => {
          const angle = (i * 7.5 * Math.PI) / 180;
          const baseRadius = 135;
          const animatedRadius = baseRadius * scaleValues.outer48;
          const x = 200 + animatedRadius * Math.cos(angle);
          const y = 200 + animatedRadius * Math.sin(angle);
          const petalAngle = i * 7.5;
          return (
            <Ellipse
              key={`outer-${i}`}
              cx={x}
              cy={y}
              rx="20"
              ry="8"
              rotation={petalAngle}
              origin={`${x}, ${y}`}
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="0.8"
              opacity={getOpacity(0.35)}
            />
          );
        })}
        
        {/* Second ring - 32 petals */}
        {[...Array(32)].map((_, i) => {
          const angle = (i * 11.25 * Math.PI) / 180;
          const baseRadius = 105;
          const animatedRadius = baseRadius * scaleValues.second32;
          const x = 200 + animatedRadius * Math.cos(angle);
          const y = 200 + animatedRadius * Math.sin(angle);
          const petalAngle = i * 11.25;
          return (
            <Ellipse
              key={`second-${i}`}
              cx={x}
              cy={y}
              rx="22"
              ry="9"
              rotation={petalAngle}
              origin={`${x}, ${y}`}
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="1"
              opacity={getOpacity(0.45)}
            />
          );
        })}
        
        {/* Third ring - 24 petals */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const baseRadius = 75;
          const animatedRadius = baseRadius * scaleValues.third24;
          const x = 200 + animatedRadius * Math.cos(angle);
          const y = 200 + animatedRadius * Math.sin(angle);
          const petalAngle = i * 15;
          return (
            <Ellipse
              key={`third-${i}`}
              cx={x}
              cy={y}
              rx="24"
              ry="10"
              rotation={petalAngle}
              origin={`${x}, ${y}`}
              fill="none"
              stroke="url(#gradient3)"
              strokeWidth="1.2"
              opacity={getOpacity(0.55)}
            />
          );
        })}
        
        {/* Fourth ring - 16 petals */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const baseRadius = 50;
          const animatedRadius = baseRadius * scaleValues.fourth16;
          const x = 200 + animatedRadius * Math.cos(angle);
          const y = 200 + animatedRadius * Math.sin(angle);
          const petalAngle = i * 22.5;
          return (
            <Ellipse
              key={`fourth-${i}`}
              cx={x}
              cy={y}
              rx="20"
              ry="9"
              rotation={petalAngle}
              origin={`${x}, ${y}`}
              fill="none"
              stroke="url(#gradient3)"
              strokeWidth="1.5"
              opacity={getOpacity(0.65)}
            />
          );
        })}
        
        {/* Inner ring - 8 petals */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const baseRadius = 30;
          const animatedRadius = baseRadius * scaleValues.inner8;
          const x = 200 + animatedRadius * Math.cos(angle);
          const y = 200 + animatedRadius * Math.sin(angle);
          const petalAngle = i * 45;
          return (
            <Ellipse
              key={`inner-${i}`}
              cx={x}
              cy={y}
              rx="16"
              ry="7"
              rotation={petalAngle}
              origin={`${x}, ${y}`}
              fill="url(#gradient3)"
              opacity={getOpacity(0.4)}
              stroke="url(#gradient3)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Protective circles with subtle breathing */}
        <Circle 
          cx="200" 
          cy="200" 
          r={150 * scaleValues.outer48} 
          fill="none" 
          stroke="url(#gradient1)" 
          strokeWidth="0.5" 
          opacity={getOpacity(0.25)} 
        />
        <Circle 
          cx="200" 
          cy="200" 
          r={145 * scaleValues.outer48} 
          fill="none" 
          stroke="url(#gradient1)" 
          strokeWidth="0.3" 
          opacity={getOpacity(0.3)} 
        />
        
        {/* Center sacred space with breathing */}
        <Circle 
          cx="200" 
          cy="200" 
          r={25 * scaleValues.center} 
          fill="url(#radialGradient)" 
          opacity={getOpacity(0.7)} 
        />
        <Circle 
          cx="200" 
          cy="200" 
          r={20 * scaleValues.center} 
          fill="none" 
          stroke="url(#gradient3)" 
          strokeWidth="2" 
          opacity={getOpacity(0.85)} 
        />
        <Circle 
          cx="200" 
          cy="200" 
          r={15 * scaleValues.center} 
          fill="none" 
          stroke="url(#gradient2)" 
          strokeWidth="1.5" 
          opacity={getOpacity(0.9)} 
        />
        <Circle 
          cx="200" 
          cy="200" 
          r={8 * scaleValues.center} 
          fill="url(#radialGradient)" 
          opacity={getOpacity(0.95)} 
        />
      </G>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Top Right Controls */}
      <View style={styles.topRightControls}>
        {/* Theme Toggle */}
        {onThemeToggle && (
          <GlassView glassEffectStyle="regular" style={styles.glassButton}>
            <TouchableOpacity
              onPress={onThemeToggle}
              activeOpacity={0.7}
              style={styles.buttonTouchable}
            >
              <Ionicons 
                name={currentTheme === 'modern' ? "flower-outline" : "ellipse-outline"} 
                size={24} 
                color="#ffffff"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </GlassView>
        )}
        
        {/* Volume Toggle */}
        {onMuteToggle && (
          <GlassView glassEffectStyle="regular" style={styles.glassButton}>
            <TouchableOpacity
              onPress={onMuteToggle}
              activeOpacity={0.7}
              style={styles.buttonTouchable}
            >
              <Ionicons 
                name={isMuted ? "volume-mute-outline" : "volume-high-outline"} 
                size={24} 
                color="#ffffff"
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>
          </GlassView>
        )}
      </View>

      {/* Mandala */}
      <View style={styles.container}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.touchableArea}
        >
          <View style={styles.mandalaWrapper}>
            {/* SVG Mandala */}
            <Svg 
              width={size} 
              height={size} 
              viewBox="0 0 400 400"
              style={styles.svg}
            >
              <Defs>
                <LinearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
                </LinearGradient>
                <LinearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
                </LinearGradient>
                <LinearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
                </LinearGradient>
                <RadialGradient id="radialGradient">
                  <Stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#a78bfa" stopOpacity="0.6" />
                </RadialGradient>
                <Filter id="glow">
                  <FeGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <FeMerge>
                    <FeMergeNode in="coloredBlur"/>
                    <FeMergeNode in="SourceGraphic"/>
                  </FeMerge>
                </Filter>
              </Defs>
              <G filter="url(#glow)">
                {renderThousandPetals()}
              </G>
            </Svg>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  topRightControls: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 100,
  },
  glassButton: {
    width: 48,
    height: 48,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
});

export default SacredGeometryMandala;

