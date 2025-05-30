import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { formatDateTime, formatQuantity } from '../utils/formatters';
import { UsageLogEntry, InventoryItem } from '../types';

interface ActivityItemProps {
  entry: UsageLogEntry;
  item: InventoryItem | undefined;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ entry, item }) => {
  if (!item) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatDateTime(entry.createdAt)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          Used {formatQuantity(entry.quantity, item.unit)} of {item.name}
        </Text>
        {entry.note && <Text style={styles.note}>{entry.note}</Text>}
        <View style={styles.details}>
          <Text style={styles.detailText}>
            Stock: {entry.previousQuantity} → {entry.previousQuantity - entry.quantity}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  timeContainer: {
    width: 100,
    paddingRight: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});

export default ActivityItem;