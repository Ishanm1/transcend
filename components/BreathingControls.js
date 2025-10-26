import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BreathingControls = ({ 
  isActive
}) => {
  return (
    <View style={styles.container}>
      {/* Instructions */}
      <Text style={styles.instructions}>
        {isActive 
          ? ''
          : 'Touch the circle to begin'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 60,
  },
  instructions: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
});

export default BreathingControls;
