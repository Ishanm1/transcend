import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassCalendar from './GlassCalendar';
import DayDetailModal from './DayDetailModal';

const { width } = Dimensions.get('window');

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
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Session History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Glass Calendar */}
          <View style={styles.calendarWrapper}>
            <GlassCalendar
              sessionHistory={sessionHistory}
              onDayPress={handleDayPress}
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
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  calendarWrapper: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
});

export default SessionCalendar;

