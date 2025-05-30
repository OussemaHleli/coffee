import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Text } from 'react-native';
import { Plus, X, FolderPlus } from 'lucide-react-native';
import { COLORS } from '../theme';

interface FloatingActionButtonProps {
  onAddItem: () => void;
  onAddCategory: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddItem,
  onAddCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  const categoryBtnStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -60],
        }),
      },
    ],
    opacity: animation,
  };

  const itemBtnStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        }),
      },
    ],
    opacity: animation,
  };

  const labelStyle = {
    transform: [
      {
        translateX: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [20, -80],
        }),
      },
    ],
    opacity: animation,
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.fabButton, styles.secondary, itemBtnStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            toggleMenu();
            onAddItem();
          }}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
        <Animated.View style={[styles.label, labelStyle]}>
          <Text style={styles.labelText}>Add Item</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.fabButton, styles.secondary, categoryBtnStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            toggleMenu();
            onAddCategory();
          }}
        >
          <FolderPlus color="white" size={24} />
        </TouchableOpacity>
        <Animated.View style={[styles.label, labelStyle]}>
          <Text style={styles.labelText}>Add Category</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.fabButton, styles.primary, rotation]}>
        <TouchableOpacity style={styles.button} onPress={toggleMenu}>
          {isOpen ? <X color="white" size={24} /> : <Plus color="white" size={24} />}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  primary: {
    backgroundColor: COLORS.coffee,
  },
  secondary: {
    backgroundColor: COLORS.oliveGreen,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    position: 'absolute',
    right: 66,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
  },
});

export default FloatingActionButton;