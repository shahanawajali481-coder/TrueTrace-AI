import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { androidApi, getDefaultApiBaseUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    androidApi.getBaseUrl().then((url) => {
      setCurrentUrl(url);
      setInputUrl(url);
    });
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await androidApi.testConnection(inputUrl);
      setTestResult({
        success: res.success,
        message: res.message,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection test error: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveUrl = async () => {
    if (!inputUrl.trim()) return;
    setIsSaving(true);
    try {
      await androidApi.setBaseUrl(inputUrl.trim());
      const saved = await androidApi.getBaseUrl();
      setCurrentUrl(saved);
      Alert.alert('Configuration Saved', `Active API base URL set to:\n${saved}`);
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Failed to save base URL.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetUrl = async () => {
    const def = await androidApi.resetBaseUrl();
    setCurrentUrl(def);
    setInputUrl(def);
    setTestResult(null);
    Alert.alert('Reset Complete', `Restored default API base URL:\n${def}`);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Purge Account & Audit History',
      'This will irreversibly delete your account, saved scans, and preferences according to GDPR privacy regulations. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Purge',
          style: 'destructive',
          onPress: async () => {
            try {
              await androidApi.deleteAccount();
              await logout();
            } catch (err: any) {
              Alert.alert('Purge Error', err.message || 'Failed to purge account.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Investigator Profile */}
      <Text style={styles.sectionHeader}>Investigator Profile</Text>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.full_name || 'Security Analyst'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'analyst@truetrace.ai'}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'USER'}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.accountCreated}>
          Account Active Since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      {/* Backend Server Network Configuration */}
      <Text style={styles.sectionHeader}>Backend Host & Network Setup</Text>
      <View style={styles.card}>
        <Text style={styles.cardDesc}>
          Configure the backend server URL. The app connects to the production cloud API configured via EXPO_PUBLIC_API_URL, or you can specify a custom endpoint below.
        </Text>

        <Text style={styles.label}>Active API Base URL</Text>
        <TextInput
          style={styles.input}
          value={inputUrl}
          onChangeText={(t) => {
            setInputUrl(t);
            setTestResult(null);
          }}
          placeholder="https://your-backend.onrender.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Quick Presets */}
        <Text style={styles.presetLabel}>Quick Presets:</Text>
        <View style={styles.presetRow}>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setInputUrl(getDefaultApiBaseUrl())}
          >
            <Text style={styles.presetText}>Default Build URL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => setInputUrl('http://10.0.2.2:8000')}
          >
            <Text style={styles.presetText}>Android Emulator (10.0.2.2)</Text>
          </TouchableOpacity>
        </View>

        {testResult && (
          <View
            style={[
              styles.testResultBox,
              testResult.success ? styles.testSuccess : styles.testFail,
            ]}
          >
            <Text
              style={[
                styles.testResultText,
                testResult.success ? { color: '#86efac' } : { color: '#fca5a5' },
              ]}
            >
              {testResult.success ? '✓' : '⚠️'} {testResult.message}
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.testBtn]}
            onPress={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Test Connection</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn]}
            onPress={handleSaveUrl}
            disabled={isSaving}
          >
            <Text style={styles.btnText}>Save & Apply</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleResetUrl} style={styles.resetBtn}>
          <Text style={styles.resetText}>Reset to Auto-Detected Default</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy & Compliance */}
      <Text style={styles.sectionHeader}>Privacy & Governance</Text>
      <View style={styles.card}>
        <Text style={styles.privacyDesc}>
          TrueTrace AI does not sell or share user data. In compliance with GDPR and CCPA privacy standards, you may permanently purge your investigator account and all associated telemetry.
        </Text>
        <TouchableOpacity style={styles.purgeBtn} onPress={handleDeleteAccount}>
          <Text style={styles.purgeText}>Irreversibly Purge Account Data</Text>
        </TouchableOpacity>
      </View>

      {/* App Architecture & Info */}
      <Text style={styles.sectionHeader}>System Architecture</Text>
      <View style={styles.card}>
        <Text style={styles.infoRow}><Text style={styles.infoKey}>App Version:</Text> 1.0.0 (Native Android)</Text>
        <Text style={styles.infoRow}><Text style={styles.infoKey}>Runtime Framework:</Text> React Native 0.74 / Expo SDK 51</Text>
        <Text style={styles.infoRow}><Text style={styles.infoKey}>Backend Engine:</Text> FastAPI Python 3.14 (ReportLab, DNS, libphonenumber)</Text>
        <Text style={styles.infoRow}><Text style={styles.infoKey}>Credential Storage:</Text> Android Hardware-Backed Keystore (SecureStore)</Text>
      </View>

      {/* Sign Out */}
      <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
        <Text style={styles.logoutBtnText}>Sign Out of TrueTrace</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050811' },
  content: { padding: 16, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  profileEmail: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  accountCreated: {
    fontSize: 11,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1e2c4f',
    borderRadius: 10,
    padding: 12,
    color: '#f8fafc',
    fontSize: 13,
    marginBottom: 10,
  },
  presetLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
  },
  presetBtn: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  presetText: {
    color: '#94a3b8',
    fontSize: 11,
  },
  testResultBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  testSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: '#22c55e',
  },
  testFail: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  testResultText: {
    fontSize: 11,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtn: {
    backgroundColor: '#334155',
  },
  saveBtn: {
    backgroundColor: '#0284c7',
  },
  btnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  resetText: {
    color: '#64748b',
    fontSize: 11,
  },
  privacyDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 12,
  },
  purgeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  purgeText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 2,
  },
  infoKey: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
});
