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

// --- 1. INSTAGRAM PROFILE SCANNER ---
export const InstagramScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [handle, setHandle] = useState('');
  const [claimedBrand, setClaimedBrand] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanHandle = (input: string): string => {
    let h = input.trim();
    if (h.startsWith('@')) h = h.substring(1);
    const match = h.match(/(?:instagram\.com\/|instagr\.am\/)([a-zA-Z0-9._]+)/);
    if (match) h = match[1];
    return h;
  };

  const handleSubmit = async () => {
    const target = cleanHandle(handle);
    if (!target) {
      setError('Please provide a valid Instagram handle or profile URL.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await androidApi.scanInstagram(target, {
        claimed_name: claimedBrand.trim() || undefined,
        message_snippet: contextNote.trim() || undefined,
      });
      navigation.replace('ReportDetail', { scanId: res.scan_id });
    } catch (err: any) {
      setError(err.message || 'Instagram scan failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Instagram Profile Check</Text>
        <Text style={styles.sub}>
          Inspect handle naming syntax, brand spoofing keywords, bot trailing digit patterns, and community scam registries.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Instagram Username or Profile URL</Text>
          <TextInput
            style={styles.input}
            value={handle}
            onChangeText={(t) => {
              setHandle(t);
              if (error) setError(null);
            }}
            placeholder="e.g. @support_meta_care or instagram.com/..."
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Claimed Brand / Pretext (Optional)</Text>
          <TextInput
            style={styles.input}
            value={claimedBrand}
            onChangeText={setClaimedBrand}
            placeholder="e.g. Meta Support, Apple Customer Service"
            placeholderTextColor="#64748b"
          />

          <Text style={styles.label}>Interaction Context (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contextNote}
            onChangeText={setContextNote}
            placeholder="e.g. DMed offering account verification badge or crypto investment"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={2}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (!handle.trim() || isLoading) && styles.btnDisabled]}
            disabled={!handle.trim() || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Analyze Instagram Signal</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>⚖️ Meta Platform & Privacy Disclosure</Text>
          <Text style={styles.infoDesc}>
            TrueTrace adheres to ethical cybersecurity principles. We do NOT breach private Instagram Direct Messages or violate Meta API policies. Risk assessments are strictly derived from public handle syntax, known impersonation patterns, and reported scam feeds.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- 2. FACEBOOK LINK SCANNER ---
export const FacebookScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [claimedPretext, setClaimedPretext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please provide a Facebook URL or page link.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await androidApi.scanFacebook(url.trim(), {
        suspected_impersonation: claimedPretext.trim() || undefined,
      });
      navigation.replace('ReportDetail', { scanId: res.scan_id });
    } catch (err: any) {
      setError(err.message || 'Facebook scan failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Facebook Link & Page Check</Text>
        <Text style={styles.sub}>
          Detect typo-squatted phishing domains, spoofed security notification pretexts, and fraudulent page appeals.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Facebook URL / Appeal Link</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={(t) => {
              setUrl(t);
              if (error) setError(null);
            }}
            placeholder="e.g. https://facebook.com/support-page or appeal link"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Claimed Pretext / Notification (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={claimedPretext}
            onChangeText={setClaimedPretext}
            placeholder="e.g. Page copyright violation warning, request to verify business manager..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={2}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (!url.trim() || isLoading) && styles.btnDisabled]}
            disabled={!url.trim() || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Validate Facebook Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🛡️ Hostname Canonicalization</Text>
          <Text style={styles.infoDesc}>
            Phishing operations frequently use deceptive hostnames (e.g. facebook-case-support.biz). TrueTrace verifies the domain root against canonical Meta properties.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- 3. WHATSAPP & PHONE SCANNER ---
export const WhatsAppScanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [contextNote, setContextNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live pre-validation state
  const [isValidating, setIsValidating] = useState(false);
  const [phoneTelemetry, setPhoneTelemetry] = useState<any>(null);
  const debounceTimer = useRef<any>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (phone.replace(/\D/g, '').length < 6) {
      setPhoneTelemetry(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const val = await androidApi.validatePhone(phone.trim(), countryCode);
        setPhoneTelemetry(val);
      } catch {
        // silent fail on pre-val
      } finally {
        setIsValidating(false);
      }
    }, 450);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [phone, countryCode]);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      setError('Please provide a phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await androidApi.scanWhatsapp(phone.trim(), {
        country_code: countryCode,
        message_snippet: contextNote.trim() || undefined,
      });
      navigation.replace('ReportDetail', { scanId: res.scan_id });
    } catch (err: any) {
      setError(err.message || 'Phone number assessment failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>WhatsApp & Phone Risk</Text>
        <Text style={styles.sub}>
          ITU-T E.164 normalization, virtual VoIP burner detection, carrier routing resolution, and premium-rate fraud analysis.
        </Text>

        <View style={styles.card}>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCol}>
              <Text style={styles.label}>Region</Text>
              <TextInput
                style={[styles.input, styles.countryInput]}
                value={countryCode}
                onChangeText={(t) => setCountryCode(t.toUpperCase().trim())}
                placeholder="US"
                placeholderTextColor="#64748b"
                maxLength={3}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.phoneCol}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t);
                  if (error) setError(null);
                }}
                placeholder="+1 202 555 0143"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Live Telemetry Pills */}
          {(isValidating || phoneTelemetry) && (
            <View style={styles.preValBox}>
              <View style={styles.preValHeader}>
                <Text style={styles.preValTitle}>⚡ TELECOM TELEMETRY</Text>
                {isValidating && <ActivityIndicator size="small" color="#38bdf8" />}
              </View>

              {phoneTelemetry && (
                <View style={styles.pillContainer}>
                  <View
                    style={[
                      styles.pill,
                      phoneTelemetry.is_valid ? styles.pillGreen : styles.pillAmber,
                    ]}
                  >
                    <Text style={styles.pillText}>
                      {phoneTelemetry.is_valid ? '✓ Valid E.164' : '⚠️ Format Incomplete'}
                    </Text>
                  </View>

                  {phoneTelemetry.line_type && (
                    <View
                      style={[
                        styles.pill,
                        phoneTelemetry.is_voip ? styles.pillRed : styles.pillGreen,
                      ]}
                    >
                      <Text style={styles.pillText}>
                        Line: {phoneTelemetry.line_type} {phoneTelemetry.is_voip ? '(Burner VoIP)' : ''}
                      </Text>
                    </View>
                  )}

                  {phoneTelemetry.carrier_name && (
                    <View style={[styles.pill, styles.pillSlate]}>
                      <Text style={styles.pillText}>Carrier: {phoneTelemetry.carrier_name}</Text>
                    </View>
                  )}

                  {phoneTelemetry.region_description && (
                    <View style={[styles.pill, styles.pillSlate]}>
                      <Text style={styles.pillText}>Geo: {phoneTelemetry.region_description}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <Text style={styles.label}>Claimed Pretext / Scam Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contextNote}
            onChangeText={setContextNote}
            placeholder="e.g. WhatsApp message claiming to be bank fraud department or lottery agent"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={2}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, (!phone.trim() || isLoading) && styles.btnDisabled]}
            disabled={!phone.trim() || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Assess Phone & WhatsApp Risk</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📞 Telephony Analysis Principles</Text>
          <Text style={styles.infoDesc}>
            Scammers heavily utilize disposable VoIP (Voice-over-IP) phone numbers purchased online to mask origin geography. TrueTrace detects virtual burner prefixes without intercepting private calls or SMS.
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
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCol: {
    width: 70,
  },
  countryInput: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  phoneCol: {
    flex: 1,
  },
  textArea: {
    minHeight: 60,
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
  pillSlate: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderColor: 'rgba(148, 163, 184, 0.25)',
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
