import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const GlassCalendar = ({ sessionHistory, onDayPress, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendar();
  }, [currentMonth, sessionHistory]);

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get days from previous month to fill the grid
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    
    const days = [];
    
    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use local date, not UTC - format as YYYY-MM-DD
      const dateYear = date.getFullYear();
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dateDay = String(date.getDate()).padStart(2, '0');
      const dateKey = `${dateYear}-${dateMonth}-${dateDay}`;
      const sessions = sessionHistory[dateKey] || [];
      
      days.push({
        day,
        isCurrentMonth: true,
        date,
        dateKey,
        sessions,
        isToday: isToday(date),
      });
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day),
      });
    }
    
    setCalendarDays(days);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getSessionIndicatorColor = (sessionCount) => {
    if (sessionCount === 0) return null;
    if (sessionCount === 1) return '#4ADEDB'; // Cyan
    if (sessionCount === 2) return '#6DD5FA'; // Light blue
    return '#2193B0'; // Deep blue
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </View>
        
        <View style={styles.navButtons}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Names Header */}
      <View style={styles.dayNamesContainer}>
        {dayNames.map((name, index) => (
          <View key={index} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarGrid}>
          {calendarDays.map((dayData, index) => {
            const sessionCount = dayData.sessions?.length || 0;
            const hasScreenshot = dayData.sessions?.some(s => s.screenshot);
            const indicatorColor = getSessionIndicatorColor(sessionCount);
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.dayCardWrapper}
                onPress={() => dayData.isCurrentMonth && onDayPress(dayData)}
                activeOpacity={0.7}
                disabled={!dayData.isCurrentMonth || sessionCount === 0}
              >
                <GlassView 
                  glassEffectStyle="regular" 
                  style={[
                    styles.dayCard,
                    !dayData.isCurrentMonth && styles.dayCardInactive,
                    dayData.isToday && styles.dayCardToday,
                    sessionCount > 0 && styles.dayCardWithSessions,
                    sessionCount > 0 && indicatorColor && { borderColor: indicatorColor },
                  ]}
                >
                  {/* Day Number */}
                  <Text style={[
                    styles.dayNumber,
                    !dayData.isCurrentMonth && styles.dayNumberInactive,
                    dayData.isToday && styles.dayNumberToday,
                  ]}>
                    {dayData.day}
                  </Text>
                  
                  {/* Screenshot Thumbnail Indicator */}
                  {hasScreenshot && dayData.sessions[0].screenshot && (
                    <View style={styles.thumbnailPreview}>
                      <Image 
                        source={{ uri: dayData.sessions[0].screenshot }}
                        style={styles.miniThumbnail}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                </GlassView>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 4,
  },
  dayCardWrapper: {
    width: (width - 70) / 7, // Full width accounting for padding and gaps
    aspectRatio: 1,
    marginBottom: 6,
  },
  dayCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0.3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  dayCardInactive: {
    opacity: 0.3,
  },
  dayCardToday: {
    borderWidth: 0.5,
    borderColor: '#4ADEDB',
  },
  dayCardWithSessions: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.3,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dayNumberInactive: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  dayNumberToday: {
    fontWeight: '700',
    fontSize: 18,
  },
  thumbnailPreview: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  miniThumbnail: {
    width: '100%',
    height: '100%',
  },
});

export default GlassCalendar;

