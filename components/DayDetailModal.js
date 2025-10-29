import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DayDetailModal = ({ visible, dayData, onClose }) => {
  const [viewingScreenshot, setViewingScreenshot] = useState(null);

  if (!dayData) return null;

  const sessions = dayData.sessions || [];
  const date = dayData.date;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalTimeForSessions = (sessions) => {
    const totalSeconds = sessions.reduce((sum, session) => {
      const [mins, secs] = session.time.split(':').map(Number);
      return sum + (mins * 60 + secs);
    }, 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalCycles = (sessions) => {
    return sessions.reduce((sum, session) => sum + session.cycles, 0);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <GlassView glassEffectStyle="regular" style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Text style={styles.sessionCountText}>
                  {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>
          </GlassView>

          {/* Stats Summary */}
          <GlassView glassEffectStyle="regular" style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color="#4ADEDB" />
                <Text style={styles.statValue}>{getTotalTimeForSessions(sessions)}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons name="refresh-outline" size={24} color="#6DD5FA" />
                <Text style={styles.statValue}>{getTotalCycles(sessions)}</Text>
                <Text style={styles.statLabel}>Total Cycles</Text>
              </View>
            </View>
          </GlassView>

          {/* Sessions List */}
          <ScrollView 
            style={styles.sessionsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sessionsListContent}
          >
            {sessions.map((session, index) => (
              <GlassView key={index} glassEffectStyle="regular" style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTimeInfo}>
                    <Ionicons name="time" size={18} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.sessionTimestamp}>{session.timestamp}</Text>
                  </View>
                  <LinearGradient
                    colors={['#4ADEDB', '#6DD5FA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sessionBadge}
                  >
                    <Text style={styles.sessionNumber}>#{index + 1}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.sessionStats}>
                  <View style={styles.sessionStatItem}>
                    <Text style={styles.sessionStatLabel}>Duration</Text>
                    <Text style={styles.sessionStatValue}>{session.time}</Text>
                  </View>
                  <View style={styles.sessionStatDivider} />
                  <View style={styles.sessionStatItem}>
                    <Text style={styles.sessionStatLabel}>Cycles</Text>
                    <Text style={styles.sessionStatValue}>{session.cycles}</Text>
                  </View>
                </View>

                {/* Screenshot */}
                {session.screenshot && (
                  <TouchableOpacity
                    style={styles.screenshotContainer}
                    onPress={() => setViewingScreenshot(session.screenshot)}
                    activeOpacity={0.8}
                  >
                    <Image 
                      source={{ uri: session.screenshot }}
                      style={styles.screenshot}
                      resizeMode="cover"
                    />
                    <View style={styles.screenshotOverlay}>
                      <Ionicons name="expand-outline" size={32} color="#ffffff" />
                      <Text style={styles.screenshotText}>View Summary</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </GlassView>
            ))}
          </ScrollView>
        </View>
      </BlurView>

      {/* Full Screenshot Viewer */}
      {viewingScreenshot && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setViewingScreenshot(null)}
        >
          <BlurView intensity={95} tint="dark" style={styles.screenshotViewerOverlay}>
            <View style={styles.screenshotViewerContainer}>
              <TouchableOpacity 
                style={styles.screenshotCloseButton}
                onPress={() => setViewingScreenshot(null)}
              >
                <Ionicons name="close-circle" size={40} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
              <Image 
                source={{ uri: viewingScreenshot }} 
                style={styles.fullScreenshot}
                resizeMode="contain"
              />
            </View>
          </BlurView>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  header: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  sessionCountText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  closeButton: {
    padding: 4,
  },
  statsContainer: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sessionsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sessionsListContent: {
    paddingBottom: 20,
  },
  sessionCard: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionTimestamp: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sessionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  sessionStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  sessionStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sessionStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  screenshotContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
    position: 'relative',
  },
  screenshot: {
    width: '100%',
    height: '100%',
  },
  screenshotOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  screenshotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  screenshotViewerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenshotViewerContainer: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  screenshotCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
  },
  fullScreenshot: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export default DayDetailModal;

