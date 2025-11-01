import AsyncStorage from '@react-native-async-storage/async-storage';

// Save a completed session to history
export const saveSession = async (sessionData) => {
  try {
    const { time, cycles, screenshot } = sessionData;
    const now = new Date();
    // Use local date, not UTC - format as YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const timestamp = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Load existing history
    const historyJSON = await AsyncStorage.getItem('sessionHistory');
    const history = historyJSON ? JSON.parse(historyJSON) : {};

    // Add new session to today's date
    if (!history[dateKey]) {
      history[dateKey] = [];
    }

    history[dateKey].push({
      time,
      cycles,
      timestamp,
      date: now.toISOString(),
      screenshot: screenshot || null, // Store screenshot URI
    });

    // Save updated history
    await AsyncStorage.setItem('sessionHistory', JSON.stringify(history));
    
    console.log('Session saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving session:', error);
    return false;
  }
};

// Get all sessions for a specific date
export const getSessionsForDate = async (dateString) => {
  try {
    const historyJSON = await AsyncStorage.getItem('sessionHistory');
    if (historyJSON) {
      const history = JSON.parse(historyJSON);
      return history[dateString] || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting sessions for date:', error);
    return [];
  }
};

// Get entire session history
export const getSessionHistory = async () => {
  try {
    const historyJSON = await AsyncStorage.getItem('sessionHistory');
    return historyJSON ? JSON.parse(historyJSON) : {};
  } catch (error) {
    console.error('Error getting session history:', error);
    return {};
  }
};

// Get stats for all time
export const getAllTimeStats = async () => {
  try {
    const history = await getSessionHistory();
    let totalSessions = 0;
    let totalSeconds = 0;
    let totalCycles = 0;

    Object.values(history).forEach(sessions => {
      sessions.forEach(session => {
        totalSessions++;
        const [mins, secs] = session.time.split(':').map(Number);
        totalSeconds += (mins * 60 + secs);
        totalCycles += session.cycles;
      });
    });

    return {
      totalSessions,
      totalTime: totalSeconds,
      totalCycles,
      daysActive: Object.keys(history).length,
    };
  } catch (error) {
    console.error('Error getting all-time stats:', error);
    return {
      totalSessions: 0,
      totalTime: 0,
      totalCycles: 0,
      daysActive: 0,
    };
  }
};

// Clear all history (for testing or user preference)
export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem('sessionHistory');
    console.log('Session history cleared');
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

// Migrate sessions that were saved with UTC dates to local dates
export const migrateDateKeysToLocal = async () => {
  try {
    const historyJSON = await AsyncStorage.getItem('sessionHistory');
    if (!historyJSON) return { migrated: 0, success: true };
    
    const history = JSON.parse(historyJSON);
    const migratedHistory = {};
    let migratedCount = 0;
    
    // For each session, check if it was stored under a UTC date
    Object.entries(history).forEach(([dateKey, sessions]) => {
      sessions.forEach(session => {
        if (session.date) {
          // Parse the stored ISO date
          const sessionDate = new Date(session.date);
          
          // Calculate what the local date key should be
          const year = sessionDate.getFullYear();
          const month = String(sessionDate.getMonth() + 1).padStart(2, '0');
          const day = String(sessionDate.getDate()).padStart(2, '0');
          const correctDateKey = `${year}-${month}-${day}`;
          
          // If the stored date key doesn't match the local date key, migrate it
          if (dateKey !== correctDateKey) {
            if (!migratedHistory[correctDateKey]) {
              migratedHistory[correctDateKey] = [];
            }
            migratedHistory[correctDateKey].push(session);
            migratedCount++;
            console.log(`Migrating session from ${dateKey} to ${correctDateKey}`);
          } else {
            // Keep it as is
            if (!migratedHistory[dateKey]) {
              migratedHistory[dateKey] = [];
            }
            migratedHistory[dateKey].push(session);
          }
        } else {
          // No date field, keep under current key
          if (!migratedHistory[dateKey]) {
            migratedHistory[dateKey] = [];
          }
          migratedHistory[dateKey].push(session);
        }
      });
    });
    
    // Save the migrated history
    if (migratedCount > 0) {
      await AsyncStorage.setItem('sessionHistory', JSON.stringify(migratedHistory));
      console.log(`Migration complete: ${migratedCount} sessions migrated`);
    }
    
    return { migrated: migratedCount, success: true };
  } catch (error) {
    console.error('Error migrating date keys:', error);
    return { migrated: 0, success: false, error };
  }
};

