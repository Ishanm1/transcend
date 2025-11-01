import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const StatCard = ({ value, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <MaskedView
        maskElement={
          <Text style={styles.valueMask}>{value}</Text>
        }
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.75)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        >
          <Text style={styles.valueTransparent}>{value}</Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  valueMask: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    backgroundColor: 'transparent',
  },
  valueTransparent: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    opacity: 0,
  },
  gradientBackground: {
    paddingVertical: 0,
  },
});

export default StatCard;

