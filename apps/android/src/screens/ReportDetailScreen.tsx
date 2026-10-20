import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { androidApi } from '../services/api';

export const ReportDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scanId } = route.params;
  const [scan, setScan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [jsonUrl, setJsonUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        setError(null);
        const data = await androidApi.getScanById(scanId);
        setScan(data);
        const [pdf, json] = await Promise.all([
          androidApi.getPdfDownloadUrl(scanId),
          androidApi.getJsonDownloadUrl(scanId),
        ]);
        setPdfUrl(pdf);
        setJsonUrl(json);
      } catch (err: any) {
        setError(err.message || 'Report not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchScan();
  }, [scanId]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await androidApi.shareScan(scanId);
      setShareInfo(res);
      const baseUrl = await androidApi.getBaseUrl();
      const fullUrl = `${baseUrl}${res.share_url}`;

      await Share.share({
        title: `TrueTrace AI Security Assessment: ${scan.masked_identifier}`,
        message: `TrueTrace AI Risk Assessment Report for ${scan.masked_identifier}:\nRisk Level: ${scan.risk_level} (${scan.risk_score}/100)\nView Report: ${fullUrl}`,
        url: fullUrl,
      });
    } catch (err: any) {
      if (err.message !== 'User did not share') {
        Alert.alert('Share Error', err.message || 'Failed to generate report share token.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Scan Record',
      'Are you sure you want to permanently remove this assessment from your registry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await androidApi.deleteScan(scanId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete record.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Compiling audit assessment...</Text>
      </View>
    );
  }

  if (error || !scan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error || 'Report not found.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Return to Console</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.vectorBadge}>
            <Text style={styles.vectorText}>
              {scan.scan_type === 'EMAIL' ? '✉️ EMAIL RISK ASSESSMENT' :
               scan.scan_type === 'INSTAGRAM' ? '📸 INSTAGRAM CHECK' :
               scan.scan_type === 'FACEBOOK' ? '🌐 FACEBOOK LINK CHECK' : '📱 WHATSAPP RISK TELEMETRY'}
            </Text>
          </View>
          <Text style={styles.timestampText}>
            {scan.created_at ? new Date(scan.created_at).toLocaleDateString() : 'Audited'}
          </Text>
        </View>

        <Text style={styles.target}>{scan.masked_identifier}</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreVal}>{scan.risk_score}<Text style={styles.scoreMax}>/100</Text></Text>
            <Text style={styles.scoreLabel}>Synthesized Risk Score</Text>
          </View>

          <View style={styles.levelBox}>
            <Text
              style={[
                styles.levelVal,
                scan.risk_level === 'HIGH' ? { color: '#ef4444' } :
                scan.risk_level === 'MEDIUM' ? { color: '#f59e0b' } :
                scan.risk_level === 'LOW' ? { color: '#22c55e' } : { color: '#94a3b8' },
              ]}
            >
              {scan.risk_level}
            </Text>
            <Text style={styles.scoreLabel}>Decision Outcome</Text>
          </View>
        </View>

        <Text style={styles.summaryTitle}>EXECUTIVE ASSESSMENT SUMMARY</Text>
        <Text style={styles.summaryText}>{scan.summary}</Text>

        {scan.confidence_explanation && (
          <View style={styles.confidenceBox}>
            <Text style={styles.confidenceTitle}>CONFIDENCE & METHODOLOGY</Text>
            <Text style={styles.confidenceText}>{scan.confidence_explanation}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons: Share, PDF, JSON */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.actionBtnIcon}>🔗</Text>
              <Text style={styles.actionBtnText}>Share Report</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#1e293b' }]}
          onPress={() => {
            Alert.alert(
              'PDF Audit Export',
              `ReportLab downloadable audit PDF is ready on backend at:\n\n${pdfUrl}`,
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.actionBtnIcon}>📄</Text>
          <Text style={styles.actionBtnText}>PDF Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#1e293b' }]}
          onPress={() => {
            Alert.alert(
              'JSON Export',
              `Structured threat intelligence JSON is ready at:\n\n${jsonUrl}`,
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={styles.actionBtnIcon}>💾</Text>
          <Text style={styles.actionBtnText}>JSON Data</Text>
        </TouchableOpacity>
      </View>

      {/* Audited Evidence Checks */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>Audited Evidence Checks</Text>
        <Text style={styles.evidenceCountBadge}>{scan.evidence?.length || 0} Indicators</Text>
      </View>

      {scan.evidence?.map((ev: any) => (
        <View key={ev.id || ev.check_id} style={styles.evidenceCard}>
          <View style={styles.evTop}>
            <Text style={styles.evName}>{ev.name}</Text>
            <View
              style={[
                styles.statusBadge,
                ev.status === 'CONFIRMED' ? styles.statusConfirmed :
                ev.status === 'SUSPICIOUS' ? styles.statusSuspicious :
                ev.status === 'INFO' ? styles.statusInfo : styles.statusUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  ev.status === 'CONFIRMED' ? { color: '#fca5a5' } :
                  ev.status === 'SUSPICIOUS' ? { color: '#fde68a' } :
                  ev.status === 'INFO' ? { color: '#86efac' } : { color: '#cbd5e1' },
                ]}
              >
                {ev.status}
              </Text>
            </View>
          </View>

          <Text style={styles.evFinding}>{ev.finding}</Text>

          <View style={styles.evMetaRow}>
            <Text style={styles.evSource}>Source: {ev.source}</Text>
            <Text style={styles.evWeight}>Weight: {Math.round((ev.reliability ?? 1) * 100)}%</Text>
          </View>

          {ev.limitations && (
            <View style={styles.evLimitationBox}>
              <Text style={styles.evLimitationText}>⚠️ {ev.limitations}</Text>
            </View>
          )}
        </View>
      ))}

      {/* Honest Limitations Notice */}
      {scan.limitations && scan.limitations.length > 0 && (
        <View style={styles.limitationsCard}>
          <Text style={styles.limitationsTitle}>⚠️ TRANSPARENT PLATFORM LIMITATIONS</Text>
          {scan.limitations.map((lim: string, idx: number) => (
            <Text key={idx} style={styles.bulletItem}>• {lim}</Text>
          ))}
        </View>
      )}

      {/* Actionable Recommendations */}
      {scan.recommendations && scan.recommendations.length > 0 && (
        <View style={styles.recCard}>
          <Text style={styles.recTitle}>🛡️ RECOMMENDED MITIGATION ACTIONS</Text>
          {scan.recommendations.map((rec: string, idx: number) => (
            <Text key={idx} style={styles.bulletItem}>• {rec}</Text>
          ))}
        </View>
      )}

      {/* Record Deletion */}
      <TouchableOpacity onPress={handleDelete} style={styles.deleteRecordBtn}>
        <Text style={styles.deleteRecordText}>🗑️ Delete This Assessment Record</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050811' },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050811',
    padding: 24,
  },
  loadingText: { color: '#94a3b8', fontSize: 13, marginTop: 12 },
  errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  backBtn: { backgroundColor: '#0284c7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  headerCard: {
    backgroundColor: '#0a0f1d',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vectorBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  vectorText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestampText: {
    color: '#64748b',
    fontSize: 10,
  },
  target: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: '#050811',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    alignItems: 'center',
  },
  scoreVal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
  },
  scoreMax: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  levelBox: {
    flex: 1,
    backgroundColor: '#050811',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelVal: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreLabel: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
    marginBottom: 12,
  },
  confidenceBox: {
    backgroundColor: '#050811',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  confidenceTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  confidenceText: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnIcon: { fontSize: 13 },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
  evidenceCountBadge: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  evidenceCard: {
    backgroundColor: '#0a0f1d',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    marginBottom: 10,
  },
  evTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  evName: { fontSize: 13, fontWeight: '700', color: '#f8fafc', flex: 1, marginRight: 8 },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusSuspicious: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusUnavailable: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  statusBadgeText: { fontSize: 9, fontWeight: 'bold' },
  evFinding: { fontSize: 12, color: '#cbd5e1', lineHeight: 17, marginBottom: 8 },
  evMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 6,
  },
  evSource: { fontSize: 10, color: '#64748b' },
  evWeight: { fontSize: 10, color: '#38bdf8', fontWeight: '600' },
  evLimitationBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 6,
    padding: 6,
    marginTop: 6,
  },
  evLimitationText: { fontSize: 10, color: '#fde68a', lineHeight: 14 },
  limitationsCard: {
    backgroundColor: '#0a0f1d',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#78350f',
    marginTop: 10,
    marginBottom: 10,
  },
  limitationsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recCard: {
    backgroundColor: '#0a0f1d',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#14532d',
    marginBottom: 16,
  },
  recTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#22c55e',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bulletItem: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 4,
  },
  deleteRecordBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteRecordText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
});
