import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { androidApi } from '../services/api';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    androidApi.getBaseUrl().then(setBaseUrl);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      // Navigation is automatically handled in RootNavigator upon user state change
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Network request failed') || msg.includes('Failed to fetch') || msg.includes('Network error')) {
        setError('Network error: Unable to reach backend. Tap the API pill at the top to configure the server URL.');
      } else {
        setError(msg || 'Login failed. Please check your credentials or backend connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Server Indicator Pill */}
        <TouchableOpacity
          style={styles.serverPill}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.serverDot} />
          <Text style={styles.serverText} numberOfLines={1}>
            API: {baseUrl || 'Not Configured (Tap to setup)'}
          </Text>
          <Text style={styles.serverEdit}>Edit</Text>
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.logoIcon}>🛡️</Text>
          <Text style={styles.logoTitle}>TrueTrace AI</Text>
          <Text style={styles.tagline}>Cross-Platform Scam & Identity Risk Engine</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Sign In to Console</Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError(null);
            }}
            placeholder="analyst@truetrace.ai"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordHeaderRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError(null);
            }}
            placeholder="••••••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (!email.trim() || !password || isLoading) && styles.btnDisabled]}
            disabled={!email.trim() || !password || isLoading}
            onPress={handleLogin}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Authenticate Session</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>
            New investigator? <Text style={styles.linkText}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    androidApi.getBaseUrl().then(setBaseUrl);
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register(email.trim(), password, name.trim());
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('Network request failed') || msg.includes('Failed to fetch') || msg.includes('Network error')) {
        setError('Network error: Unable to reach backend. Tap the API pill at the top to configure the server URL.');
      } else {
        setError(msg || 'Registration failed. Email may already be in use.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Server Indicator Pill */}
        <TouchableOpacity
          style={styles.serverPill}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.serverDot} />
          <Text style={styles.serverText} numberOfLines={1}>
            API: {baseUrl || 'Not Configured (Tap to setup)'}
          </Text>
          <Text style={styles.serverEdit}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.brandHeader}>
          <Text style={styles.logoIcon}>🛡️</Text>
          <Text style={styles.logoTitle}>TrueTrace AI</Text>
          <Text style={styles.tagline}>Create Your Security Analyst Account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Investigator Registration</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(null);
            }}
            placeholder="Jane Doe"
            placeholderTextColor="#64748b"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Work Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError(null);
            }}
            placeholder="analyst@company.com"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.passwordHeaderRow}>
            <Text style={styles.label}>Password (8+ chars)</Text>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError(null);
            }}
            placeholder="••••••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (error) setError(null);
            }}
            placeholder="••••••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.btnDisabled]}
            disabled={isLoading}
            onPress={handleRegister}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Create Analyst Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>
            Already registered? <Text style={styles.linkText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
    maxWidth: '90%',
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  serverText: {
    color: '#94a3b8',
    fontSize: 11,
    marginRight: 6,
  },
  serverEdit: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#0a0f1d',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    marginBottom: 20,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showHideText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1e2c4f',
    borderRadius: 10,
    padding: 12,
    color: '#f8fafc',
    fontSize: 14,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerLink: {
    paddingVertical: 12,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  linkText: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
