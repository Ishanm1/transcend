import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassView } from 'expo-glass-effect';

const SessionTimer = ({ time, cycleCount, circleSize }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassView 
      glassEffectStyle="regular"
      style={[styles.container, { width: circleSize }]}
    >
      {/* Session Column */}
      <View style={styles.column}>
        <Text style={styles.label}>SESSION</Text>
        <Text style={styles.value}>{formatTime(time)}</Text>
      </View>
      
      {/* Vertical Divider */}
      <View style={styles.divider} />
      
      {/* Cycles Column */}
      <View style={styles.column}>
        <Text style={styles.label}>CYCLES</Text>
        <Text style={styles.value}>{cycleCount}</Text>
      </View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    height: 70,
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  column: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
  },
});

export default SessionTimer;

