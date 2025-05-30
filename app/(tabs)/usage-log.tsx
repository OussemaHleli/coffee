import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateItemQuantity } from '../../store/slices/inventorySlice';
import { addEntry } from '../../store/slices/usageLogSlice';
import { COLORS } from '../../theme';
import Dropdown from '../../components/Dropdown';
import FormInput from '../../components/FormInput';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import { formatQuantity } from '../../utils/formatters';
import { Category, InventoryItem } from '../../types';

export default function UsageLogScreen() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const inventoryItems = useAppSelector((state) => state.inventory.items);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [warningDialogVisible, setWarningDialogVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const selectedItem = inventoryItems.find(
    (item) => item.id === selectedItemId
  );
  
  // Filter items based on selected category
  const filteredItems = selectedCategoryId
    ? inventoryItems.filter((item) => item.categoryId === selectedCategoryId)
    : [];
  
  // Reset item selection when category changes
  useEffect(() => {
    setSelectedItemId('');
  }, [selectedCategoryId]);
  
  // Validate form
  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    
    if (!selectedCategoryId) {
      formErrors.category = 'Please select a category';
    }
    
    if (!selectedItemId) {
      formErrors.item = 'Please select an item';
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      formErrors.quantity = 'Please enter a valid quantity';
    } else if (selectedItem && parseFloat(quantity) > selectedItem.quantity) {
      formErrors.quantity = 'Quantity exceeds available stock';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const parsedQuantity = parseFloat(quantity);
    
    // Check if quantity exceeds 80% of available stock
    if (
      selectedItem &&
      parsedQuantity > selectedItem.quantity * 0.8 &&
      parsedQuantity < selectedItem.quantity
    ) {
      setWarningDialogVisible(true);
      return;
    }
    
    processUsageLog();
  };
  
  // Process the usage log
  const processUsageLog = () => {
    if (selectedItem) {
      const parsedQuantity = parseFloat(quantity);
      const previousQuantity = selectedItem.quantity;
      const newQuantity = previousQuantity - parsedQuantity;
      
      // Create usage log entry
      const logEntry = {
        id: `log_${Date.now()}`,
        itemId: selectedItemId,
        quantity: parsedQuantity,
        previousQuantity,
        note,
        createdAt: new Date().toISOString(),
      };
      
      // Update inventory quantity
      dispatch(
        updateItemQuantity({
          id: selectedItemId,
          quantity: newQuantity,
        })
      );
      
      // Add usage log entry
      dispatch(addEntry(logEntry));
      
      // Show success message
      setSuccessMessage(
        `Used ${formatQuantity(parsedQuantity, selectedItem.unit)} of ${
          selectedItem.name
        }`
      );
      setSuccessDialogVisible(true);
      
      // Reset form
      resetForm();
    }
  };
  
  // Reset form
  const resetForm = () => {
    setSelectedCategoryId('');
    setSelectedItemId('');
    setQuantity('');
    setNote('');
    setErrors({});
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usage Logger</Text>
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Log Item Usage</Text>
            <Text style={styles.formSubtitle}>
              Record items used in operations
            </Text>
            
            <View style={styles.formGroup}>
              <Dropdown
                label="Category"
                value={selectedCategoryId}
                options={categories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
                onChange={setSelectedCategoryId}
                placeholder="Select a category"
                error={errors.category}
              />
              
              <Dropdown
                label="Item"
                value={selectedItemId}
                options={filteredItems.map((item) => ({
                  label: `${item.name} (${formatQuantity(
                    item.quantity,
                    item.unit
                  )})`,
                  value: item.id,
                }))}
                onChange={setSelectedItemId}
                placeholder={
                  selectedCategoryId
                    ? 'Select an item'
                    : 'Select a category first'
                }
                error={errors.item}
              />
              
              {selectedItem && (
                <View style={styles.stockInfo}>
                  <Text style={styles.stockText}>
                    Current Stock:{' '}
                    <Text style={styles.stockValue}>
                      {formatQuantity(selectedItem.quantity, selectedItem.unit)}
                    </Text>
                  </Text>
                </View>
              )}
              
              <FormInput
                label="Quantity Used"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                keyboardType="numeric"
                error={errors.quantity}
              />
              
              <FormInput
                label="Note (Optional)"
                value={note}
                onChangeText={setNote}
                placeholder="Add a note about this usage"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.noteInput}
              />
            </View>
            
            <Button
              title="Log Usage"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Success Dialog */}
      <Dialog
        visible={successDialogVisible}
        title="Usage Logged"
        message={successMessage}
        confirmText="Done"
        onConfirm={() => setSuccessDialogVisible(false)}
        onCancel={() => setSuccessDialogVisible(false)}
        type="success"
      />
      
      {/* Warning Dialog */}
      <Dialog
        visible={warningDialogVisible}
        title="Low Stock Warning"
        message="This usage will significantly reduce the stock level. Are you sure you want to continue?"
        confirmText="Continue"
        onConfirm={() => {
          setWarningDialogVisible(false);
          processUsageLog();
        }}
        onCancel={() => setWarningDialogVisible(false)}
      />
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    fontFamily: 'Roboto-Medium',
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontFamily: 'Roboto-Regular',
  },
  formGroup: {
    marginBottom: 16,
  },
  stockInfo: {
    backgroundColor: COLORS.creamLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  stockText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Roboto-Medium',
  },
  stockValue: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  noteInput: {
    height: 80,
  },
  submitButton: {
    marginTop: 8,
  },
});