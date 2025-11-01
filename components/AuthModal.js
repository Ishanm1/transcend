import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const AuthModal = ({ visible, onClose, onSuccess, title, message }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp: signUpUser } = useAuth();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      setConfirmPassword('');
      setError(null);
      setIsSignUp(false);

      // Entrance animation
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your name');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUpUser(email, password, name);
        if (signUpError) {
          setError(signUpError.message || 'Sign up failed');
          setIsLoading(false);
          return;
        }
        // Show success message for sign up
        Alert.alert(
          'Account Created',
          'Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => {
            if (onSuccess) onSuccess();
            onClose();
          }}]
        );
      } else {
        const { data, error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message || 'Sign in failed');
          setIsLoading(false);
          return;
        }
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={95} tint="dark" style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <BlurView intensity={100} tint="dark" style={styles.glassContainer}>
                  {/* Header */}
                  <View style={styles.header}>
                    <View style={styles.headerContent}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="person-circle-outline" size={32} color="#4ADEDB" />
                      </View>
                      <View style={styles.headerText}>
                        <Text style={styles.title}>{title || 'Sign In Required'}</Text>
                        {message && (
                          <Text style={styles.subtitle}>{message}</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.9)" />
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* Error Message */}
                    {error && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={18} color="#ff6b6b" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    {/* Name Input (Sign Up Only) */}
                    {isSignUp && (
                      <>
                        <Text style={styles.label}>Name</Text>
                        <GlassView glassEffectStyle="regular" style={styles.inputContainer}>
                          <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            autoCapitalize="words"
                            editable={!isLoading}
                          />
                        </GlassView>
                      </>
                    )}

                    {/* Email Input */}
                    <Text style={styles.label}>Email</Text>
                    <GlassView glassEffectStyle="regular" style={styles.inputContainer}>
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="rgba(255,255,255,0.6)"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                    </GlassView>

                    {/* Password Input */}
                    <Text style={styles.label}>Password</Text>
                    <GlassView glassEffectStyle="regular" style={styles.inputContainer}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="rgba(255,255,255,0.6)"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={20}
                          color="rgba(255,255,255,0.6)"
                        />
                      </TouchableOpacity>
                    </GlassView>

                    {/* Confirm Password (Sign Up Only) */}
                    {isSignUp && (
                      <>
                        <Text style={styles.label}>Confirm Password</Text>
                        <GlassView glassEffectStyle="regular" style={styles.inputContainer}>
                          <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="rgba(255,255,255,0.6)"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={[styles.input, styles.passwordInput]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            editable={!isLoading}
                          />
                        </GlassView>
                      </>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={isLoading}
                      activeOpacity={0.8}
                      style={styles.submitButton}
                    >
                      <LinearGradient
                        colors={['#4ADEDB', '#6DD5FA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                      >
                        <Text style={styles.submitButtonText}>
                          {isLoading
                            ? 'Please wait...'
                            : isSignUp
                            ? 'Create Account'
                            : 'Sign In'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Toggle Sign Up/Sign In */}
                    <View style={styles.toggleContainer}>
                      <Text style={styles.toggleText}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setIsSignUp(!isSignUp);
                          setError(null);
                        }}
                        disabled={isLoading}
                      >
                        <Text style={styles.toggleLink}>
                          {isSignUp ? 'Sign In' : 'Sign Up'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 420,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  glassContainer: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 219, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 219, 0.3)',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 20,
  },
  scrollView: {
    maxHeight: 500,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ff6b6b',
    lineHeight: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ADEDB',
  },
});

export default AuthModal;

