import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  RefreshControl,
  Modal,
} from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { COLORS } from '../../theme';
import { CalendarDays, ArrowLeft, ArrowRight } from 'lucide-react-native';
import DateHeader from '../../components/DateHeader';
import HistoryListItem from '../../components/HistoryListItem';
import Button from '../../components/Button';
import { UsageLogEntry, InventoryItem } from '../../types';
import { groupLogsByDate } from '../../utils/calculations';
import { formatDateTime, formatQuantity } from '../../utils/formatters';

export default function HistoryScreen() {
  const usageLogs = useAppSelector((state) => state.usageLogs.entries);
  const inventory = useAppSelector((state) => state.inventory.items);
  
  const [refreshing, setRefreshing] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<UsageLogEntry | null>(null);
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all');
  
  // Filter logs by date range
  const filteredLogs = usageLogs.filter((entry) => {
    if (dateRange === 'all') return true;
    
    const entryDate = new Date(entry.createdAt);
    const now = new Date();
    const diffDays = Math.ceil(
      (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (dateRange === '7days') return diffDays <= 7;
    if (dateRange === '30days') return diffDays <= 30;
    
    return true;
  });
  
  // Group logs by date
  const groupedLogs = groupLogsByDate(filteredLogs);
  
  // Convert grouped logs to section list format
  const sections = Object.entries(groupedLogs)
    .map(([date, entries]) => ({
      date,
      data: entries,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // Sort by date, newest first
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleEntryPress = (entry: UsageLogEntry) => {
    setSelectedEntry(entry);
    setDetailModalVisible(true);
  };
  
  // Get item details for selected entry
  const getItemForEntry = (entry: UsageLogEntry): InventoryItem | undefined => {
    return inventory.find((item) => item.id === entry.itemId);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usage History</Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            dateRange === '7days' && styles.filterButtonActive,
          ]}
          onPress={() => setDateRange('7days')}
        >
          <Text
            style={[
              styles.filterText,
              dateRange === '7days' && styles.filterTextActive,
            ]}
          >
            Last 7 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            dateRange === '30days' && styles.filterButtonActive,
          ]}
          onPress={() => setDateRange('30days')}
        >
          <Text
            style={[
              styles.filterText,
              dateRange === '30days' && styles.filterTextActive,
            ]}
          >
            Last 30 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            dateRange === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setDateRange('all')}
        >
          <Text
            style={[
              styles.filterText,
              dateRange === 'all' && styles.filterTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {sections.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarDays size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyStateText}>
              No usage history found for the selected period
            </Text>
            <Button
              title="View All History"
              onPress={() => setDateRange('all')}
              variant={dateRange === 'all' ? 'outline' : 'primary'}
            />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <DateHeader
                date={section.date}
                count={section.data.length}
              />
            )}
            renderItem={({ item }) => (
              <HistoryListItem
                entry={item}
                item={getItemForEntry(item)}
                onPress={handleEntryPress}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            stickySectionHeadersEnabled
          />
        )}
      </View>
      
      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <ArrowLeft size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Usage Details</Text>
              <View style={styles.placeholder} />
            </View>
            
            {selectedEntry && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date & Time</Text>
                  <Text style={styles.detailValue}>
                    {formatDateTime(selectedEntry.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Item</Text>
                  <Text style={styles.detailValue}>
                    {getItemForEntry(selectedEntry)?.name || 'Unknown Item'}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity Used</Text>
                  <Text style={styles.detailValue}>
                    {formatQuantity(
                      selectedEntry.quantity,
                      getItemForEntry(selectedEntry)?.unit || 'pcs'
                    )}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Previous Stock</Text>
                  <Text style={styles.detailValue}>
                    {formatQuantity(
                      selectedEntry.previousQuantity,
                      getItemForEntry(selectedEntry)?.unit || 'pcs'
                    )}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>New Stock</Text>
                  <Text style={styles.detailValue}>
                    {formatQuantity(
                      selectedEntry.previousQuantity - selectedEntry.quantity,
                      getItemForEntry(selectedEntry)?.unit || 'pcs'
                    )}
                  </Text>
                </View>
                
                {selectedEntry.note && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.detailLabel}>Note</Text>
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>{selectedEntry.note}</Text>
                    </View>
                  </View>
                )}
                
                <Button
                  title="Close"
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.closeDetailButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.coffee,
    padding: 16,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto-Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.coffee,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Roboto-Medium',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'Roboto-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  closeButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Roboto-Medium',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: 'Roboto-Regular',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    fontFamily: 'Roboto-Medium',
  },
  noteContainer: {
    paddingVertical: 12,
  },
  noteBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    fontFamily: 'Roboto-Regular',
  },
  closeDetailButton: {
    marginTop: 24,
  },
});