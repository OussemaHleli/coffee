import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { InventoryItem } from '../types';
import { formatCurrency, formatQuantity } from '../utils/formatters';

interface InventoryItemCardProps {
  item: InventoryItem;
  onPress: (item: InventoryItem) => void;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.quantity}>
          {formatQuantity(item.quantity, item.unit)}
        </Text>
        <View 
          style={[
            styles.indicator, 
            item.quantity <= 5 ? styles.indicatorLow : styles.indicatorNormal
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.coffee,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorNormal: {
    backgroundColor: COLORS.oliveGreen,
  },
  indicatorLow: {
    backgroundColor: COLORS.warning,
  },
});

export default InventoryItemCard;