import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../theme';
import { Category } from '../types';

interface CategoryHeaderProps {
  category: Category;
  isExpanded: boolean;
  onToggle: (categoryId: string) => void;
  itemCount: number;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  category,
  isExpanded,
  onToggle,
  itemCount,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(category.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{category.name}</Text>
        <Text style={styles.count}>{itemCount} items</Text>
      </View>
      {isExpanded ? (
        <ChevronDown size={20} color={COLORS.textSecondary} />
      ) : (
        <ChevronRight size={20} color={COLORS.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.creamLight,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  count: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default CategoryHeader;