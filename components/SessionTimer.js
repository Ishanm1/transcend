import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SessionTimer = ({ time, circleSize }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { width: circleSize }]}>
      <Text style={styles.label}>SESSION</Text>
      <Text style={styles.time}>{formatTime(time)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    zIndex: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
  },
  time: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
  },
});

export default SessionTimer;

