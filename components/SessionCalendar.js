import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { migrateDateKeysToLocal } from '../utils/sessionStorage';
import GlassCalendar from './GlassCalendar';
import DayDetailModal from './DayDetailModal';

const SessionCalendar = ({ visible, onClose }) => {
  const [sessionHistory, setSessionHistory] = useState({});
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [showDayDetail, setShowDayDetail] = useState(false);

  // Load session history from AsyncStorage
  useEffect(() => {
    if (visible) {
      loadSessionHistory();
    }
  }, [visible]);

  const loadSessionHistory = async () => {
    try {
      // Run migration first to fix any UTC date issues
      await migrateDateKeysToLocal();
      
      const historyJSON = await AsyncStorage.getItem('sessionHistory');
      if (historyJSON) {
        const history = JSON.parse(historyJSON);
        setSessionHistory(history);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  const handleDayPress = (dayData) => {
    setSelectedDayData(dayData);
    setShowDayDetail(true);
  };

  const handleCloseDayDetail = () => {
    setShowDayDetail(false);
    setSelectedDayData(null);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Glass Calendar */}
          <View style={styles.calendarWrapper}>
            <GlassCalendar
              sessionHistory={sessionHistory}
              onDayPress={handleDayPress}
              onClose={onClose}
            />
          </View>
        </View>
      </BlurView>

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={showDayDetail}
        dayData={selectedDayData}
        onClose={handleCloseDayDetail}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 4,
    paddingTop: 40,
  },
  calendarWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
});

export default SessionCalendar;

