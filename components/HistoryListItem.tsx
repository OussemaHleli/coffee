import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { formatTime, formatQuantity } from '../utils/formatters';
import { UsageLogEntry, InventoryItem } from '../types';

interface HistoryListItemProps {
  entry: UsageLogEntry;
  item: InventoryItem | undefined;
  onPress: (entry: UsageLogEntry) => void;
}

const HistoryListItem: React.FC<HistoryListItemProps> = ({
  entry,
  item,
  onPress,
}) => {
  if (!item) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.quantity}>
          {formatQuantity(entry.quantity, item.unit)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  timeContainer: {
    width: 60,
    marginRight: 12,
  },
  time: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.coffee,
  },
});

export default HistoryListItem;