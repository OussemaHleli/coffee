import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { formatDate } from '../utils/formatters';

interface DateHeaderProps {
  date: string;
  count: number;
}

const DateHeader: React.FC<DateHeaderProps> = ({ date, count }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDate(date)}</Text>
      <Text style={styles.count}>{count} items</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  count: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default DateHeader;