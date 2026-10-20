import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { androidApi } from '../services/api';

export const ScanHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [scans, setScans] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedRisk, setSelectedRisk] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    try {
      setError(null);
      const res = await androidApi.getScans(1, 50, undefined, selectedRisk);
      setScans(res.scans || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve scan history.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [selectedRisk]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScans();
  };

  const handleDelete = (scanId: string, identifier: string) => {
    Alert.alert(
      'Delete Scan Record',
      `Permanently remove assessment for ${identifier}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await androidApi.deleteScan(scanId);
              setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
              setTotal((prev) => Math.max(0, prev - 1));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete scan.');
            }
          },
        },
      ]
    );
  };

  const riskFilters = [
    { label: 'All', value: undefined },
    { label: 'High Risk', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low Risk', value: 'LOW' },
    { label: 'Inconclusive', value: 'INCONCLUSIVE' },
  ];

  return (
    <View style={styles.container}>
      {/* Risk Filter Chips */}
      <View style={styles.filterRow}>
        {riskFilters.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[
              styles.filterChip,
              selectedRisk === f.value && styles.filterChipActive,
            ]}
            onPress={() => {
              setSelectedRisk(f.value);
              setIsLoading(true);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedRisk === f.value && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Summary Line */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {isLoading ? 'Synchronizing...' : `Showing ${scans.length} of ${total} security records`}
        </Text>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {isLoading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Loading audit logs...</Text>
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No Scan Records Found</Text>
          <Text style={styles.emptySub}>
            {selectedRisk
              ? `No scans matching filter '${selectedRisk}'. Try selecting 'All'.`
              : 'Execute an email, profile, or phone scan from the Dashboard to build your audit registry.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.scan_id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38bdf8"
              colors={['#38bdf8']}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ReportDetail', { scanId: item.scan_id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardTop}>
                <View style={styles.vectorBadge}>
                  <Text style={styles.vectorText}>
                    {item.scan_type === 'EMAIL' ? '✉️ EMAIL' :
                     item.scan_type === 'INSTAGRAM' ? '📸 INSTAGRAM' :
                     item.scan_type === 'FACEBOOK' ? '🌐 FACEBOOK' : '📱 WHATSAPP'}
                  </Text>
                </View>

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
                    {item.risk_score}/100 • {item.risk_level}
                  </Text>
                </View>
              </View>

              <Text style={styles.identifier} numberOfLines={1}>
                {item.masked_identifier}
              </Text>

              {item.summary && (
                <Text style={styles.summarySnippet} numberOfLines={2}>
                  {item.summary}
                </Text>
              )}

              <View style={styles.cardBottom}>
                <Text style={styles.dateText}>
                  {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                </Text>

                <TouchableOpacity
                  onPress={() => handleDelete(item.scan_id, item.masked_identifier)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050811',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0a0f1d',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2c4f',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterChipActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.25)',
    borderColor: '#38bdf8',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e2c4f',
  },
  cardTop: {
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
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  riskMedium: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  riskLow: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  riskInconclusive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  riskPillText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  identifier: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  summarySnippet: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 8,
    marginTop: 4,
  },
  dateText: {
    fontSize: 10,
    color: '#64748b',
  },
  deleteBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#ef4444',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 10,
    margin: 16,
    borderRadius: 8,
  },
  errorText: { color: '#fca5a5', fontSize: 12 },
});
