import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../utils/colors';
import AuthAPI from '../services/authAPI';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import {useNotification} from "../components/NotificationSystem";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const [step, setStep] = useState(1); // 1 for username, 2 for password, 3 for registration
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userExists, setUserExists] = useState(null);
  const { showModal, showSuccess, showError } = useNotification();
  // Modal and Toast states
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { loginUser, skipLogin } = useUser();
  const passwordInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);



  // Removed showAlert function - using custom components instead

  const validateUsername = (value) => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.trim().length < 3) {
      return 'Username must be at least 3 characters';
    }
    return null;
  };

  const validatePassword = (value) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const checkNewPassword = (value) => {
    if (!value) {
      setErrors({ password: 'Password is required' });
      return;
    }
    if (value.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    setStep(3)
  }

  const handleUsernameNext = async () => {
    const error = validateUsername(username);
    if (error) {
      setErrors({ username: error });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Check if username exists
      const result = await AuthAPI.checkUsername(username);

      if (result.success) {
        const exists = result.data.exists || result.data.userExists;
        setUserExists(exists);

        if (exists) {
          // User exists - proceed to login
          setMode('login');
          setStep(2);
          setTimeout(() => {
            passwordInputRef.current?.focus();
          }, 300);
        } else {
          // User doesn't exist - offer registration
          setShowNewUserModal(true);
        }
      } else {
        // API error
        setErrors({ username: result.error || 'Unable to check username. Please check your connection and try again.' });
      }
    } catch (error) {
      console.error('Username check error:', error);
      setErrors({ username: 'Network connection error. Please check your internet and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await AuthAPI.authenticateUser(username, password);

      if (result.success) {
        const userData = {
          ...result.data.user,
          loginTime: new Date().toISOString(),
        };

        await loginUser(userData);
      } else {
        // Authentication failed
        setErrors({ password: result.error || 'Invalid username or password. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ password: 'Login failed. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (value) => {
    if (!value.trim()) {
      return 'Phone number is required';
    }
    // Add more validation logic if needed
    return null;
  };

  const handleRegister = async () => {
    console.log(111)
    const passwordError = validatePassword(password);
    const phoneNumberError = validatePhoneNumber(phone);
    if (phoneNumberError) {
      setErrors({phone: phoneNumberError});
      showError(phoneNumberError);
      return;
    }

    if (passwordError) {
      setErrors({ password: passwordError });
      console.log(222, passwordError);
      return;
    }

    // Validate optional fields
    if (email && !isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      console.log(333, 'Please enter a valid email address');
      return;
    }
    console.log(444)
    setErrors({});
    setLoading(true);

    try {
      const userData = {
        username,
        password,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      const result = await AuthAPI.createUser(userData);

      if (result.success) {
        // Registration successful - auto login
        const newUserData = {
          ...result.data.user,
          loginTime: new Date().toISOString(),
        };

        // Show success toast and auto login
        setSuccessMessage(`Welcome to SaleSale, ${username}! Account created successfully.`);
        setShowSuccessToast(true);

        // Auto login after a short delay to let user see the success message
        setTimeout(() => {
          loginUser(newUserData);
        }, 1500);
      } else {
        setErrors({ password: result.error || 'Registration failed. Please check your details and try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ password: 'Registration failed. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSkipLogin = () => {
    setShowSkipModal(true);
  };

  const renderStep1 = () => (
      <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
      >
        <Text style={styles.stepTitle}>What's your username?</Text>
        <Text style={styles.stepSubtitle}>Enter your username to get started</Text>

        <TextInput
            style={[
              styles.input,
              errors.username && styles.inputError,
            ]}
            placeholder="Enter username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({});
            }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={handleUsernameNext}
            autoFocus={false}
        />

        {errors.username && (
            <Text style={styles.errorText}>{errors.username}</Text>
        )}

        <TouchableOpacity
            style={[
              styles.nextButton,
              (!username.trim() || loading) && styles.nextButtonDisabled,
            ]}
            onPress={handleUsernameNext}
            disabled={!username.trim() || loading}
        >
          <Text style={[
            styles.nextButtonText,
            (!username.trim() || loading) && styles.nextButtonTextDisabled,
          ]}>
            {loading ? 'Checking...' : 'Next →'}
          </Text>
        </TouchableOpacity>
          <View >
              <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkipLogin}
                  disabled={loading}
              >
                  <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>

              <Text style={styles.skipDescription}>
                  Continue as guest - you can login anytime later
              </Text>
          </View>
      </Animated.View>
  );

  const renderStep2 = () => {
    if (mode === 'login') {
      return (
          <Animated.View
              style={[
                styles.stepContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
          >
            <Text style={styles.stepTitle}>Welcome back, {username}!</Text>
            <Text style={styles.stepSubtitle}>Please enter your password</Text>

            <TextInput
                ref={passwordInputRef}
                style={[
                  styles.input,
                  errors.password && styles.inputError,
                ]}
                placeholder="Enter password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({});
                }}
                secureTextEntry={true}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
            />

            {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep(1);
                  setPassword('');
                  setErrors({});
                  setUserExists(null);
                }}
                disabled={loading}
            >
              <Text style={styles.backButtonText}>← Change Username</Text>
            </TouchableOpacity>
          </Animated.View>
      );
    } else {
      // Registration mode
      return (
          <Animated.View
              style={[
                styles.stepContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
          >
            <Text style={styles.stepTitle}>Create Account</Text>
            <Text style={styles.stepSubtitle}>Setup your password for {username}</Text>

            <TextInput
                ref={passwordInputRef}
                style={[
                  styles.input,
                  errors.password && styles.inputError,
                ]}
                placeholder="Create password (min 6 characters)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({});
                }}
                secureTextEntry={true}
                returnKeyType="next"
                onSubmitEditing={() => checkNewPassword(password)}
            />

            {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!password || loading) && styles.nextButtonDisabled,
                ]}
                onPress={() => checkNewPassword(password)}
                disabled={!password || loading}
            >
              <Text style={[
                styles.nextButtonText,
                (!password || loading) && styles.nextButtonTextDisabled,
              ]}>
                Continue →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setStep(1);
                  setPassword('');
                  setErrors({});
                  setUserExists(null);
                  setMode('login');
                }}
                disabled={loading}
            >
              <Text style={styles.backButtonText}>← Change Username</Text>
            </TouchableOpacity>
          </Animated.View>
      );
    }
  };

  const renderStep3 = () => (
      <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
      >
        <Text style={styles.stepTitle}>Almost Done!</Text>
        <Text style={styles.stepSubtitle}>Tell us a bit about yourself (optional)</Text>

        <TextInput
            style={styles.input}
            placeholder="Full Name (optional)"
            value={name}
            onChangeText={setName}
            returnKeyType="next"
        />

        <TextInput
            style={[
              styles.input,
              errors.email && styles.inputError,
            ]}
            placeholder="Email (optional)"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({});
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
        />

        {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
        )}

        <TextInput
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
        />

        <TouchableOpacity
            style={[
              styles.loginButton,
              loading && styles.loginButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setStep(2);
              setName('');
              setEmail('');
              setPhone('');
              setErrors({});
            }}
            disabled={loading}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </Animated.View>
  );

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image
              source={require('../assets/logo-one-line.png')}
              style={styles.logo}
              resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Welcome to SaleSale!</Text>
        </View>

        <View style={styles.content}>
          {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
        </View>

        {/*<View style={styles.footer}>*/}
        {/*  <TouchableOpacity*/}
        {/*      style={styles.skipButton}*/}
        {/*      onPress={handleSkipLogin}*/}
        {/*      disabled={loading}*/}
        {/*  >*/}
        {/*    <Text style={styles.skipButtonText}>Skip for now</Text>*/}
        {/*  </TouchableOpacity>*/}

        {/*  <Text style={styles.skipDescription}>*/}
        {/*    Continue as guest - you can login anytime later*/}
        {/*  </Text>*/}
        {/*</View>*/}

          <View style={styles.demoInfo}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>username: Ravindu</Text>
              <Text style={styles.demoText}>Password: ravindu</Text>
          </View>

        {/* New User Confirmation Modal */}
        <ConfirmationModal
            visible={showNewUserModal}
            message={`No user found! Would you like to create a new account?`}
            buttons={[
              {
                text: 'Try Different Username',
                style: 'cancel',
                onPress: () => {
                  setUsername('');
                  setUserExists(null);
                  setShowNewUserModal(false);
                },
              },
              {
                text: 'Create Account',
                onPress: () => {
                  setMode('register');
                  setStep(2);
                  setShowNewUserModal(false);
                  setTimeout(() => {
                    passwordInputRef.current?.focus();
                  }, 300);
                },
              },
            ]}
            onClose={() => setShowNewUserModal(false)}
        />

        {/* Skip Login Confirmation Modal */}
        <ConfirmationModal
            visible={showSkipModal}
            type="warning"
            title="Skip Login"
            message="You can browse as a guest, but some features may be limited. You can login later from the profile section."
            buttons={[
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setShowSkipModal(false),
              },
              {
                text: 'Continue as Guest',
                onPress: async () => {
                  setShowSkipModal(false);
                  await skipLogin();
                },
              },
            ]}
            onClose={() => setShowSkipModal(false)}
        />

        {/* Success Toast */}
        <Toast
            visible={showSuccessToast}
            message={successMessage}
            type="success"
            position="top"
            duration={2000}
            onHide={() => setShowSuccessToast(false)}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: COLORS.textOnBlack,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
    demoInfo: {
        backgroundColor: 'rgb(0 0 0 / 9%)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 20
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 8,
    },
    demoText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
  loginButton: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  skipButton: {
      marginTop: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  skipButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  skipDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});