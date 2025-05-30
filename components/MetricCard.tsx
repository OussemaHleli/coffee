import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MetricCardProps } from '../types';
import { COLORS } from '../theme';

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  iconContainer: {
    backgroundColor: COLORS.creamLight,
    borderRadius: 8,
    padding: 12,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});

export default MetricCard;