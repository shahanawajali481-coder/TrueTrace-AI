import React, { useState, useEffect, useRef } from 'react';
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
import { androidApi } from '../services/api';

export const EmailScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Live pre-validation state
  const [isValidating, setIsValidating] = useState(false);
  const [preValidation, setPreValidation] = useState<any>(null);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!email.trim() || !email.includes('@')) {
      setPreValidation(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const val = await androidApi.validateEmail(email.trim());
        setPreValidation(val);
      } catch {
        // silent fail on pre-validation
      } finally {
        setIsValidating(false);
      }
    }, 450);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [email]);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    setLoadingStep('Resolving Authoritative DNS & MX...');

    const timer1 = setTimeout(() => setLoadingStep('Checking Throwaway & Scam Registries...'), 1000);
    const timer2 = setTimeout(() => setLoadingStep('Synthesizing Risk Engine Evidence...'), 2000);

    try {
      const res = await androidApi.scanEmail(email.trim(), contextNote.trim() ? { message_snippet: contextNote.trim() } : undefined);
      navigation.replace('ReportDetail', { scanId: res.scan_id });
    } catch (err: any) {
      setError(err.message || 'Email scan assessment failed.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Email Risk Analyzer</Text>
        <Text style={styles.sub}>
          Real-time authoritative DNS resolution, MX presence verification, throwaway inbox matching, and authority impersonation heuristics.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Target Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError(null);
            }}
            placeholder="e.g. security-alert@suspicious-domain.com"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Live Pre-Validation Badge Indicators */}
          {(isValidating || preValidation) && (
            <View style={styles.preValBox}>
              <View style={styles.preValHeader}>
                <Text style={styles.preValTitle}>⚡ LIVE TELEMETRY</Text>
                {isValidating && <ActivityIndicator size="small" color="#38bdf8" />}
              </View>

              {preValidation && (
                <View style={styles.pillContainer}>
                  <View
                    style={[
                      styles.pill,
                      preValidation.is_valid ? styles.pillGreen : styles.pillRed,
                    ]}
                  >
                    <Text style={styles.pillText}>
                      {preValidation.is_valid ? '✓ Valid Syntax' : '✗ Invalid Format'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.pill,
                      preValidation.is_disposable ? styles.pillRed : styles.pillGreen,
                    ]}
                  >
                    <Text style={styles.pillText}>
                      {preValidation.is_disposable ? '⚠️ Disposable Domain' : '✓ Normal Domain'}
                    </Text>
                  </View>

                  {preValidation.has_mx_records !== undefined && (
                    <View
                      style={[
                        styles.pill,
                        preValidation.has_mx_records ? styles.pillGreen : styles.pillAmber,
                      ]}
                    >
                      <Text style={styles.pillText}>
                        {preValidation.has_mx_records ? '✓ MX Records Active' : '⚠️ No MX Found'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <Text style={styles.label}>Context / Suspicious Content (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contextNote}
            onChangeText={setContextNote}
            placeholder="Paste suspicious subject line, urgency pretext, or payment request..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={3}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (!email.trim() || isLoading) && styles.btnDisabled]}
            disabled={!email.trim() || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <View style={styles.btnLoadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.btnTextLoading}>{loadingStep || 'Analyzing...'}</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Perform Multi-Vector Risk Scan</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔒 Privacy & Operational Standard</Text>
          <Text style={styles.infoDesc}>
            No unsolicited emails or pingbacks are ever dispatched. TrueTrace queries authoritative DNS nameservers passively and correlates indicators against threat intelligence registries.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050811' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  sub: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginBottom: 18 },
  card: {
    backgroundColor: '#0a0f1d',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e2c4f',
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
    marginBottom: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  preValBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  preValHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  preValTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  pillGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  pillRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  pillAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  pillText: {
    fontSize: 10,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: { color: '#fca5a5', fontSize: 12 },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnTextLoading: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0a0f1d',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoTitle: { color: '#38bdf8', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  infoDesc: { color: '#64748b', fontSize: 11, lineHeight: 16 },
});
