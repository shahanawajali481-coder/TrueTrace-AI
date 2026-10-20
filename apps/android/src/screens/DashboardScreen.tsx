import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { androidApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await androidApi.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to sync dashboard telemetry.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#38bdf8"
          colors={['#38bdf8']}
        />
      }
    >
      {/* Investigator Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.consoleTitle}>SECURITY COMMAND CONSOLE</Text>
          <Text style={styles.userName}>{user?.full_name || 'Investigator'}</Text>
          <Text style={styles.userRole}>
            Role: <Text style={styles.roleHighlight}>{user?.role?.toUpperCase() || 'ANALYST'}</Text> • {user?.email}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => navigation.navigate('ScanHistory')}
          >
            <Text style={styles.actionIconText}>📜</Text>
            <Text style={styles.actionIconLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.actionIconText}>⚙️</Text>
            <Text style={styles.actionIconLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Launch Analyzers Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Launch Signal Scan</Text>
        <Text style={styles.sectionSubtitle}>Select vector</Text>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickCard, { borderColor: '#0284c7' }]}
          onPress={() => navigation.navigate('EmailScan')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconBg, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
            <Text style={styles.quickIcon}>✉️</Text>
          </View>
          <Text style={styles.quickTitle}>Email Risk</Text>
          <Text style={styles.quickSub}>DNS, MX & Throwaway</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { borderColor: '#ec4899' }]}
          onPress={() => navigation.navigate('InstagramScan')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconBg, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
            <Text style={styles.quickIcon}>📸</Text>
          </View>
          <Text style={styles.quickTitle}>Instagram</Text>
          <Text style={styles.quickSub}>Spoofing & Pretexts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { borderColor: '#8b5cf6' }]}
          onPress={() => navigation.navigate('FacebookScan')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Text style={styles.quickIcon}>🌐</Text>
          </View>
          <Text style={styles.quickTitle}>Facebook</Text>
          <Text style={styles.quickSub}>Phishing URLs & Pages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { borderColor: '#10b981' }]}
          onPress={() => navigation.navigate('WhatsAppScan')}
          activeOpacity={0.8}
        >
          <View style={[styles.quickIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Text style={styles.quickIcon}>📱</Text>
          </View>
          <Text style={styles.quickTitle}>WhatsApp</Text>
          <Text style={styles.quickSub}>VoIP & Carrier Check</Text>
        </TouchableOpacity>
      </View>

      {/* Account Telemetry Overview */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Account Telemetry</Text>
        {isLoading && <ActivityIndicator size="small" color="#38bdf8" />}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats?.total_scans ?? 0}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>

        <View style={[styles.statBox, { borderColor: '#22c55e' }]}>
          <Text style={[styles.statVal, { color: '#22c55e' }]}>{stats?.low_risk_count ?? 0}</Text>
          <Text style={styles.statLabel}>Low Risk</Text>
        </View>

        <View style={[styles.statBox, { borderColor: '#f59e0b' }]}>
          <Text style={[styles.statVal, { color: '#f59e0b' }]}>{stats?.medium_risk_count ?? 0}</Text>
          <Text style={styles.statLabel}>Medium</Text>
        </View>

        <View style={[styles.statBox, { borderColor: '#ef4444' }]}>
          <Text style={[styles.statVal, { color: '#ef4444' }]}>{stats?.high_risk_count ?? 0}</Text>
          <Text style={styles.statLabel}>High Risk</Text>
        </View>
      </View>

      {/* Recent Scans */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Intelligence Scans</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ScanHistory')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Scans Recorded Yet</Text>
          <Text style={styles.emptySub}>
            Initiate a scan above to analyze potentially fraudulent emails, profiles, or phone numbers.
          </Text>
        </View>
      ) : (
        stats.recent_activity.map((item: any) => (
          <TouchableOpacity
            key={item.scan_id}
            style={styles.recentItem}
            onPress={() => navigation.navigate('ReportDetail', { scanId: item.scan_id })}
            activeOpacity={0.7}
          >
            <View style={styles.recentLeft}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {item.scan_type === 'EMAIL' ? '✉️ EMAIL' :
                   item.scan_type === 'INSTAGRAM' ? '📸 INSTA' :
                   item.scan_type === 'FACEBOOK' ? '🌐 FACEBOOK' : '📱 PHONE'}
                </Text>
              </View>
              <Text style={styles.recentIdentifier} numberOfLines={1}>
                {item.masked_identifier}
              </Text>
            </View>

            <View style={styles.recentRight}>
              <View
                style={[
                  styles.riskPill,
                  item.risk_level === 'HIGH' ? styles.riskHigh :
                  item.risk_level === 'MEDIUM' ? styles.riskMedium :
                  item.risk_level === 'LOW' ? styles.riskLow : styles.riskInconclusive,
                ]}
              >
                <Text
                  style={[
                    styles.riskPillText,
                    item.risk_level === 'HIGH' ? { color: '#fca5a5' } :
                    item.risk_level === 'MEDIUM' ? { color: '#fde68a' } :
                    item.risk_level === 'LOW' ? { color: '#86efac' } : { color: '#cbd5e1' },
                  ]}
                >
                  {item.risk_score}/100 {item.risk_level}
                </Text>
              </View>
              <Text style={styles.recentChevron}>›</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Sign Out Banner */}
      <View style={styles.footerLogout}>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Sign Out of Current Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  consoleTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  userRole: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  roleHighlight: {
    color: '#a5b4fc',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 50,
  },
  actionIconText: {
    fontSize: 16,
  },
  actionIconLabel: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    flex: 1,
  },
  retryBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  viewAllText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  quickIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickIcon: {
    fontSize: 20,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 2,
  },
  quickSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0a0f1d',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e2c4f',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyCard: {
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e2c4f',
    marginBottom: 8,
  },
  recentLeft: {
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeBadgeText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
  recentIdentifier: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  recentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  riskMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  riskLow: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  riskInconclusive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  riskPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recentChevron: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerLogout: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
  },
  logoutBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});
