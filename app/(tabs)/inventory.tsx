import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addItem, updateItem } from '../../store/slices/inventorySlice';
import { addCategory } from '../../store/slices/categorySlice';
import { COLORS } from '../../theme';
import SearchBar from '../../components/SearchBar';
import CategoryHeader from '../../components/CategoryHeader';
import InventoryItemCard from '../../components/InventoryItemCard';
import FloatingActionButton from '../../components/FloatingActionButton';
import FormInput from '../../components/FormInput';
import Dropdown from '../../components/Dropdown';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import { Category, InventoryItem, CategoryWithItems, Unit } from '../../types';

export default function InventoryScreen() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.categories);
  const inventoryItems = useAppSelector((state) => state.inventory.items);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [isEditItemModalVisible, setIsEditItemModalVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  
  // Form states
  const [formItem, setFormItem] = useState<Partial<InventoryItem>>({
    name: '',
    categoryId: '',
    quantity: 0,
    unit: 'pcs',
    price: 0,
  });
  
  const [formCategory, setFormCategory] = useState<Partial<Category>>({
    name: '',
    parentId: null,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Filter and group items by category
  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categories
        .find((cat) => cat.id === item.categoryId)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );
  
  // Get parent categories (those with no parentId)
  const parentCategories = categories.filter(
    (category) => category.parentId === null
  );
  
  // Group categories with their items
  const categoriesWithItems: CategoryWithItems[] = parentCategories.map(
    (parent) => {
      const childCategories = categories.filter(
        (cat) => cat.parentId === parent.id
      );
      
      const directItems = filteredItems.filter(
        (item) => item.categoryId === parent.id
      );
      
      const childItems = childCategories.flatMap((child) =>
        filteredItems.filter((item) => item.categoryId === child.id)
      );
      
      return {
        ...parent,
        items: [...directItems, ...childItems],
      };
    }
  );
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  // Initialize with all categories expanded
  useEffect(() => {
    setExpandedCategories(parentCategories.map((cat) => cat.id));
  }, []);
  
  // Form validation
  const validateItemForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formItem.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formItem.categoryId) {
      errors.categoryId = 'Category is required';
    }
    
    if (formItem.quantity === undefined || formItem.quantity < 0) {
      errors.quantity = 'Quantity must be a positive number';
    }
    
    if (formItem.price === undefined || formItem.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateCategoryForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formCategory.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleAddItem = () => {
    if (validateItemForm()) {
      const newItem: InventoryItem = {
        id: `item_${Date.now()}`,
        name: formItem.name!,
        categoryId: formItem.categoryId!,
        quantity: formItem.quantity!,
        unit: formItem.unit as Unit,
        price: formItem.price!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(addItem(newItem));
      setIsAddItemModalVisible(false);
      resetForms();
    }
  };
  
  const handleUpdateItem = () => {
    if (validateItemForm() && selectedItem) {
      const updatedItem: InventoryItem = {
        ...selectedItem,
        name: formItem.name!,
        categoryId: formItem.categoryId!,
        quantity: formItem.quantity!,
        unit: formItem.unit as Unit,
        price: formItem.price!,
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(updateItem(updatedItem));
      setIsEditItemModalVisible(false);
      resetForms();
    }
  };
  
  const handleAddCategory = () => {
    if (validateCategoryForm()) {
      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        name: formCategory.name!,
        parentId: formCategory.parentId,
      };
      
      dispatch(addCategory(newCategory));
      setIsAddCategoryModalVisible(false);
      resetForms();
    }
  };
  
  // Reset form states
  const resetForms = () => {
    setFormItem({
      name: '',
      categoryId: '',
      quantity: 0,
      unit: 'pcs',
      price: 0,
    });
    
    setFormCategory({
      name: '',
      parentId: null,
    });
    
    setFormErrors({});
    setSelectedItem(null);
  };
  
  // Handle item selection for editing
  const handleItemPress = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormItem({
      name: item.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
    });
    setIsEditItemModalVisible(true);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Manager</Text>
      </View>
      
      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search items or categories..."
        />
        
        {categoriesWithItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No items found</Text>
            <Button
              title="Add Your First Item"
              onPress={() => setIsAddItemModalVisible(true)}
              variant="primary"
            />
          </View>
        ) : (
          <FlatList
            data={categoriesWithItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item: category }) => (
              <View style={styles.categorySection}>
                <CategoryHeader
                  category={category}
                  isExpanded={expandedCategories.includes(category.id)}
                  onToggle={toggleCategory}
                  itemCount={category.items.length}
                />
                
                {expandedCategories.includes(category.id) && (
                  <View style={styles.itemsContainer}>
                    {category.items.length === 0 ? (
                      <Text style={styles.emptyCategory}>
                        No items in this category
                      </Text>
                    ) : (
                      category.items.map((item) => (
                        <InventoryItemCard
                          key={item.id}
                          item={item}
                          onPress={handleItemPress}
                        />
                      ))
                    )}
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
      
      <FloatingActionButton
        onAddItem={() => setIsAddItemModalVisible(true)}
        onAddCategory={() => setIsAddCategoryModalVisible(true)}
      />
      
      {/* Add Item Modal */}
      <Modal
        visible={isAddItemModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsAddItemModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TouchableOpacity
              onPress={() => {
                setIsAddItemModalVisible(false);
                resetForms();
              }}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <FormInput
              label="Item Name"
              value={formItem.name}
              onChangeText={(text) => setFormItem({ ...formItem, name: text })}
              error={formErrors.name}
              placeholder="Enter item name"
            />
            
            <Dropdown
              label="Category"
              value={formItem.categoryId || ''}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              onChange={(value) =>
                setFormItem({ ...formItem, categoryId: value })
              }
              error={formErrors.categoryId}
              placeholder="Select a category"
            />
            
            <FormInput
              label="Quantity"
              value={formItem.quantity?.toString() || ''}
              onChangeText={(text) =>
                setFormItem({
                  ...formItem,
                  quantity: parseFloat(text) || 0,
                })
              }
              error={formErrors.quantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
            />
            
            <Dropdown
              label="Unit"
              value={formItem.unit || 'pcs'}
              options={[
                { label: 'Pieces', value: 'pcs' },
                { label: 'Kilograms', value: 'kg' },
                { label: 'Grams', value: 'g' },
                { label: 'Liters', value: 'l' },
                { label: 'Milliliters', value: 'ml' },
                { label: 'Box', value: 'box' },
              ]}
              onChange={(value) =>
                setFormItem({ ...formItem, unit: value as Unit })
              }
              placeholder="Select a unit"
            />
            
            <FormInput
              label="Price (TND)"
              value={formItem.price?.toString() || ''}
              onChangeText={(text) =>
                setFormItem({
                  ...formItem,
                  price: parseFloat(text) || 0,
                })
              }
              error={formErrors.price}
              placeholder="Enter price"
              keyboardType="numeric"
            />
            
            <Button
              title="Add Item"
              onPress={handleAddItem}
              style={styles.submitButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Edit Item Modal */}
      <Modal
        visible={isEditItemModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsEditItemModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TouchableOpacity
              onPress={() => {
                setIsEditItemModalVisible(false);
                resetForms();
              }}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <FormInput
              label="Item Name"
              value={formItem.name}
              onChangeText={(text) => setFormItem({ ...formItem, name: text })}
              error={formErrors.name}
              placeholder="Enter item name"
            />
            
            <Dropdown
              label="Category"
              value={formItem.categoryId || ''}
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              onChange={(value) =>
                setFormItem({ ...formItem, categoryId: value })
              }
              error={formErrors.categoryId}
              placeholder="Select a category"
            />
            
            <FormInput
              label="Quantity"
              value={formItem.quantity?.toString() || ''}
              onChangeText={(text) =>
                setFormItem({
                  ...formItem,
                  quantity: parseFloat(text) || 0,
                })
              }
              error={formErrors.quantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
            />
            
            <Dropdown
              label="Unit"
              value={formItem.unit || 'pcs'}
              options={[
                { label: 'Pieces', value: 'pcs' },
                { label: 'Kilograms', value: 'kg' },
                { label: 'Grams', value: 'g' },
                { label: 'Liters', value: 'l' },
                { label: 'Milliliters', value: 'ml' },
                { label: 'Box', value: 'box' },
              ]}
              onChange={(value) =>
                setFormItem({ ...formItem, unit: value as Unit })
              }
              placeholder="Select a unit"
            />
            
            <FormInput
              label="Price (TND)"
              value={formItem.price?.toString() || ''}
              onChangeText={(text) =>
                setFormItem({
                  ...formItem,
                  price: parseFloat(text) || 0,
                })
              }
              error={formErrors.price}
              placeholder="Enter price"
              keyboardType="numeric"
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Update Item"
                onPress={handleUpdateItem}
                style={styles.submitButton}
              />
              
              <Button
                title="Delete Item"
                onPress={() => setIsDeleteDialogVisible(true)}
                variant="outline"
                style={styles.deleteButton}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Add Category Modal */}
      <Modal
        visible={isAddCategoryModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TouchableOpacity
              onPress={() => {
                setIsAddCategoryModalVisible(false);
                resetForms();
              }}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <FormInput
              label="Category Name"
              value={formCategory.name}
              onChangeText={(text) =>
                setFormCategory({ ...formCategory, name: text })
              }
              error={formErrors.name}
              placeholder="Enter category name"
            />
            
            <Dropdown
              label="Parent Category (Optional)"
              value={formCategory.parentId || ''}
              options={[
                { label: 'None (Top Level)', value: '' },
                ...parentCategories.map((cat) => ({
                  label: cat.name,
                  value: cat.id,
                })),
              ]}
              onChange={(value) =>
                setFormCategory({
                  ...formCategory,
                  parentId: value || null,
                })
              }
              placeholder="Select a parent category"
            />
            
            <Button
              title="Add Category"
              onPress={handleAddCategory}
              style={styles.submitButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={isDeleteDialogVisible}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          // Handle delete logic here
          setIsDeleteDialogVisible(false);
          setIsEditItemModalVisible(false);
          resetForms();
        }}
        onCancel={() => setIsDeleteDialogVisible(false)}
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
  content: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  itemsContainer: {
    marginLeft: 8,
    marginTop: 8,
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
    marginBottom: 16,
  },
  emptyCategory: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    padding: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.coffee,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto-Bold',
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.cream,
    fontFamily: 'Roboto-Medium',
  },
  modalContent: {
    padding: 16,
    flex: 1,
  },
  modalActions: {
    marginTop: 16,
    marginBottom: 40,
  },
  submitButton: {
    marginTop: 16,
  },
  deleteButton: {
    marginTop: 12,
  },
});