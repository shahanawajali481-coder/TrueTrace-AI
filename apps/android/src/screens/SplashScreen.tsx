import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { androidApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, isLoading } = useAuth();
  const [serverStatus, setServerStatus] = useState<string>('Connecting to TrueTrace engine...');
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const test = await androidApi.testConnection();
        if (!isMounted) return;

        if (test.success) {
          setServerStatus(`Engine Online (${test.latencyMs}ms)`);
          setTimeout(() => {
            if (!isMounted) return;
            if (user) {
              navigation.replace('Dashboard');
            } else {
              navigation.replace('Login');
            }
          }, 600);
        } else {
          setServerStatus(test.message);
          setHasError(true);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setServerStatus('Failed to connect to backend server');
        setHasError(true);
      }
    };

    if (!isLoading) {
      checkHealth();
    }

    return () => {
      isMounted = false;
    };
  }, [isLoading, user, navigation]);

  return (
    <View style={styles.container}>
      {/* Brand Icon & Glow */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🛡️</Text>
      </View>

      <Text style={styles.brandTitle}>TrueTrace AI</Text>
      <Text style={styles.tagline}>Verify Signals. Detect Risks. Stay Safe.</Text>

      {/* Loading Indicator or Retry */}
      <View style={styles.statusBox}>
        {!hasError ? (
          <>
            <ActivityIndicator size="small" color="#38bdf8" />
            <Text style={styles.statusText}>{serverStatus}</Text>
          </>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {serverStatus}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setHasError(false);
                  setServerStatus('Reconnecting...');
                  androidApi.testConnection().then((test) => {
                    if (test.success) {
                      setServerStatus(`Engine Online (${test.latencyMs}ms)`);
                      if (user) navigation.replace('Dashboard');
                      else navigation.replace('Login');
                    } else {
                      setServerStatus(test.message);
                      setHasError(true);
                    }
                  });
                }}
              >
                <Text style={styles.btnText}>Retry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: '#334155' }]}
                onPress={() => navigation.navigate('Settings')}
              >
                <Text style={styles.btnText}>Configure IP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>TrueTrace AI Native Android • v1.0.0</Text>
        <Text style={styles.securityText}>Evidence-based • Zero Privacy Intrusion</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'center',
  },
  statusBox: {
    marginTop: 40,
    alignItems: 'center',
    minHeight: 80,
  },
  statusText: {
    color: '#38bdf8',
    fontSize: 12,
    marginTop: 10,
    letterSpacing: 0.2,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    width: '100%',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  versionText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  securityText: {
    color: '#334155',
    fontSize: 10,
    marginTop: 3,
  },
});
