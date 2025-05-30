import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { 
  Coffee, 
  PackageCheck, 
  PenLine,
  Clipboard,
  ArrowUp,
} from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addNote } from '../../store/slices/dailyNoteSlice';
import { COLORS } from '../../theme';
import MetricCard from '../../components/MetricCard';
import ActivityItem from '../../components/ActivityItem';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import { formatCurrency } from '../../utils/formatters';
import { calculateTotalInventoryValue, calculateTodayMovements } from '../../utils/calculations';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const inventory = useAppSelector((state) => state.inventory.items);
  const usageLogs = useAppSelector((state) => state.usageLogs.entries);
  const dailyNotes = useAppSelector((state) => state.dailyNotes.notes);
  
  const [refreshing, setRefreshing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteDialogVisible, setNoteDialogVisible] = useState(false);
  
  const totalValue = calculateTotalInventoryValue(inventory);
  const todayMovements = calculateTodayMovements(usageLogs);
  
  // Sort logs by creation date (newest first)
  const sortedLogs = [...usageLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get today's note if exists
  const today = new Date().toISOString().split('T')[0];
  const todayNote = dailyNotes.find((note) => note.date === today);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  const handleAddNote = () => {
    if (noteText.trim()) {
      dispatch(
        addNote({
          id: `note_${Date.now()}`,
          date: today,
          content: noteText,
          createdAt: new Date().toISOString(),
        })
      );
      setNoteText('');
      setNoteDialogVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Coffee Inventory</Text>
        <Text style={styles.headerSubtitle}>Dashboard</Text>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Total Stock Value"
            value={formatCurrency(totalValue)}
            icon={<Coffee size={24} color={COLORS.coffee} />}
          />
          
          <MetricCard
            title="Today's Usage"
            value={todayMovements.count}
            subtitle={`${todayMovements.value} items used`}
            icon={<PackageCheck size={24} color={COLORS.oliveGreen} />}
          />
          
          <View style={styles.noteCard}>
            <View style={styles.noteCardHeader}>
              <View style={styles.iconContainer}>
                <PenLine size={24} color={COLORS.coffee} />
              </View>
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Daily Note</Text>
                {todayNote ? (
                  <Text style={styles.noteText}>{todayNote.content}</Text>
                ) : (
                  <Text style={styles.noteEmpty}>No note for today</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.addNoteButton}
              onPress={() => setNoteDialogVisible(true)}
            >
              <Text style={styles.addNoteText}>
                {todayNote ? 'Update Note' : 'Add Note'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Text style={styles.sectionSubtitle}>
              {sortedLogs.length} entries
            </Text>
          </View>
          
          {sortedLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Clipboard size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyStateText}>No activity logged yet</Text>
              <Button
                title="Log First Usage"
                onPress={() => {/* Navigate to usage log */}}
                variant="primary"
              />
            </View>
          ) : (
            <FlatList
              data={sortedLogs.slice(0, 10)} // Show only 10 most recent
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ActivityItem
                  entry={item}
                  item={inventory.find((inv) => inv.id === item.itemId)}
                />
              )}
              scrollEnabled={false} // Prevent nested scrolling
            />
          )}
          
          {sortedLogs.length > 10 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Activity</Text>
              <ArrowUp style={{ transform: [{ rotate: '45deg' }] }} size={16} color={COLORS.coffee} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      
      <Dialog
        visible={noteDialogVisible}
        title="Daily Note"
        message="Add a note for today's operations"
        confirmText="Save"
        onConfirm={handleAddNote}
        onCancel={() => setNoteDialogVisible(false)}
      >
        <TextInput
          style={styles.noteInput}
          value={noteText}
          onChangeText={setNoteText}
          placeholder="Enter your note here..."
          multiline
        />
      </Dialog>
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
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.creamLight,
    marginTop: 4,
    fontFamily: 'Roboto-Regular',
  },
  scrollView: {
    flex: 1,
  },
  metricsContainer: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  noteCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: COLORS.creamLight,
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  noteEmpty: {
    fontSize: 16,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  addNoteButton: {
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    marginTop: 8,
  },
  addNoteText: {
    color: COLORS.coffee,
    fontWeight: '500',
    fontSize: 14,
  },
  activityContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 100, // Extra padding for bottom tabs
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontFamily: 'Roboto-Medium',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginVertical: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    marginTop: 8,
  },
  viewAllText: {
    color: COLORS.coffee,
    fontWeight: '500',
    marginRight: 8,
  },
  noteInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginTop: 12,
  },
});