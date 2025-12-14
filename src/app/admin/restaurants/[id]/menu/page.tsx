'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, X, Check, AlertTriangle, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { MenuItem } from '@/types';

interface MenuEditPageProps {
  params: Promise<{ id: string }>;
}

interface MenuChange {
  type: 'edit' | 'add' | 'delete' | 'toggle';
  item: MenuItem;
  originalItem?: MenuItem;
  field?: string;
}

export default function MenuEditPage({ params }: MenuEditPageProps) {
  const { id: restaurantId } = use(params);
  const router = useRouter();
  
  const [restaurant, setRestaurant] = useState<{ name: string; id: string } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [originalItems, setOriginalItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track changes for summary
  const [changes, setChanges] = useState<MenuChange[]>([]);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ index: number; field: 'price' | 'itemName' | 'category' | 'description' } | null>(null);
  
  // New item form
  const [newItem, setNewItem] = useState<MenuItem>({
    itemName: '',
    price: 0,
    category: '',
    vegNonVeg: 'Veg',
    description: '',
    inStock: true
  });

  // Fetch restaurant and menu data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/menu/${restaurantId}`);
        if (!res.ok) throw new Error('Failed to fetch menu');
        const data = await res.json();
        setRestaurant({ name: data.restaurantName, id: restaurantId });
        setMenuItems(data.items || []);
        setOriginalItems(JSON.parse(JSON.stringify(data.items || [])));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [restaurantId]);

  // Get unique categories from menu
  const categories = [...new Set(menuItems.map(item => item.category))].filter(Boolean);

  // Track a change
  const trackChange = (change: MenuChange) => {
    setChanges(prev => {
      // Remove existing change for same item if editing
      const filtered = prev.filter(c => 
        !(c.item.itemName === change.item.itemName && c.type === change.type)
      );
      return [...filtered, change];
    });
  };

  // Update item price
  const updateItemPrice = (index: number, newPrice: number) => {
    const updatedItems = [...menuItems];
    const originalItem = originalItems.find(i => i.itemName === updatedItems[index].itemName);
    
    if (originalItem && originalItem.price !== newPrice) {
      trackChange({
        type: 'edit',
        item: { ...updatedItems[index], price: newPrice },
        originalItem,
        field: 'price'
      });
    }
    
    updatedItems[index] = { ...updatedItems[index], price: newPrice };
    setMenuItems(updatedItems);
    setEditingItem(null);
  };

  // Update item name
  const updateItemName = (index: number, newName: string) => {
    const updatedItems = [...menuItems];
    const originalItem = originalItems.find(i => i.itemName === updatedItems[index].itemName);
    
    if (originalItem && originalItem.itemName !== newName) {
      trackChange({
        type: 'edit',
        item: { ...updatedItems[index], itemName: newName },
        originalItem,
        field: 'itemName'
      });
    }
    
    updatedItems[index] = { ...updatedItems[index], itemName: newName };
    setMenuItems(updatedItems);
    setEditingItem(null);
  };

  // Toggle item stock status
  const toggleItemStock = (index: number) => {
    const updatedItems = [...menuItems];
    const newInStock = updatedItems[index].inStock === false ? true : false;
    
    trackChange({
      type: 'toggle',
      item: { ...updatedItems[index], inStock: newInStock },
      field: 'inStock'
    });
    
    updatedItems[index] = { ...updatedItems[index], inStock: newInStock };
    setMenuItems(updatedItems);
  };

  // Delete item
  const deleteItem = (index: number) => {
    const itemToDelete = menuItems[index];
    trackChange({
      type: 'delete',
      item: itemToDelete
    });
    
    const updatedItems = menuItems.filter((_, i) => i !== index);
    setMenuItems(updatedItems);
  };

  // Add new item
  const addItem = () => {
    if (!newItem.itemName || !newItem.category || newItem.price <= 0) {
      return;
    }
    
    const itemToAdd = { ...newItem, inStock: true };
    trackChange({
      type: 'add',
      item: itemToAdd
    });
    
    setMenuItems([...menuItems, itemToAdd]);
    setNewItem({
      itemName: '',
      price: 0,
      category: '',
      vegNonVeg: 'Veg',
      description: '',
      inStock: true
    });
    setShowAddModal(false);
  };

  // Calculate changes summary
  const getChangesSummary = () => {
    const edits = changes.filter(c => c.type === 'edit');
    const adds = changes.filter(c => c.type === 'add');
    const deletes = changes.filter(c => c.type === 'delete');
    const toggles = changes.filter(c => c.type === 'toggle');
    
    return { edits, adds, deletes, toggles };
  };

  // Save changes
  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/menu/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: menuItems })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save menu');
      }
      
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setChanges([]);
      setOriginalItems(JSON.parse(JSON.stringify(menuItems)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Check if there are unsaved changes
  const hasChanges = changes.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold">{error}</p>
          <Link href="/admin/restaurants" className="text-orange-600 hover:underline mt-4 inline-block">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const summary = getChangesSummary();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/restaurants" 
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Edit Menu</h1>
                <p className="text-sm text-slate-500">{restaurant?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!hasChanges || saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                  hasChanges 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                Save Changes {hasChanges && `(${changes.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Changes indicator */}
      {hasChanges && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-orange-700">
            <AlertTriangle className="w-4 h-4" />
            <span>
              You have {changes.length} unsaved change{changes.length > 1 ? 's' : ''}
              {summary.edits.length > 0 && ` • ${summary.edits.length} edited`}
              {summary.adds.length > 0 && ` • ${summary.adds.length} added`}
              {summary.deletes.length > 0 && ` • ${summary.deletes.length} deleted`}
              {summary.toggles.length > 0 && ` • ${summary.toggles.length} toggled`}
            </span>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 mb-4">No menu items found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-orange-600 font-bold hover:underline"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                  <h2 className="font-bold text-slate-900">{category}</h2>
                  <p className="text-xs text-slate-500">
                    {menuItems.filter(i => i.category === category).length} items
                  </p>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {menuItems
                    .map((item, index) => ({ item, index }))
                    .filter(({ item }) => item.category === category)
                    .map(({ item, index }) => (
                      <div 
                        key={`${item.itemName}-${index}`}
                        className={`px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${
                          item.inStock === false ? 'opacity-50 bg-red-50/50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${
                              item.vegNonVeg === 'Non-Veg' ? 'border-red-500' : 'border-green-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.vegNonVeg === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'
                              }`}></span>
                            </span>
                            
                            {editingItem?.index === index && editingItem?.field === 'itemName' ? (
                              <input
                                type="text"
                                defaultValue={item.itemName}
                                autoFocus
                                className="font-bold text-slate-900 border border-orange-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                onBlur={(e) => updateItemName(index, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') updateItemName(index, e.currentTarget.value);
                                  if (e.key === 'Escape') setEditingItem(null);
                                }}
                              />
                            ) : (
                              <span 
                                className="font-bold text-slate-900 cursor-pointer hover:text-orange-600"
                                onClick={() => setEditingItem({ index, field: 'itemName' })}
                              >
                                {item.itemName}
                              </span>
                            )}
                            
                            {item.inStock === false && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                Disabled
                              </span>
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="text-xs text-slate-500 truncate">{item.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Price */}
                          {editingItem?.index === index && editingItem?.field === 'price' ? (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500">₹</span>
                              <input
                                type="number"
                                defaultValue={item.price}
                                autoFocus
                                className="w-20 font-bold text-slate-900 border border-orange-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                onBlur={(e) => updateItemPrice(index, parseInt(e.target.value) || item.price)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') updateItemPrice(index, parseInt(e.currentTarget.value) || item.price);
                                  if (e.key === 'Escape') setEditingItem(null);
                                }}
                              />
                            </div>
                          ) : (
                            <span 
                              className="font-bold text-slate-900 cursor-pointer hover:text-orange-600 min-w-[60px] text-right"
                              onClick={() => setEditingItem({ index, field: 'price' })}
                            >
                              ₹{item.price}
                            </span>
                          )}
                          
                          {/* Toggle Stock */}
                          <button
                            onClick={() => toggleItemStock(index)}
                            className={`p-2 rounded-lg transition-colors ${
                              item.inStock === false 
                                ? 'text-red-600 hover:bg-red-100' 
                                : 'text-green-600 hover:bg-green-100'
                            }`}
                            title={item.inStock === false ? 'Enable item' : 'Disable item'}
                          >
                            {item.inStock === false ? (
                              <ToggleLeft className="w-5 h-5" />
                            ) : (
                              <ToggleRight className="w-5 h-5" />
                            )}
                          </button>
                          
                          {/* Delete */}
                          <button
                            onClick={() => deleteItem(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Item"
        variant="info"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name *</label>
            <input
              type="text"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Chicken Biryani"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="150"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Type *</label>
              <select
                value={newItem.vegNonVeg}
                onChange={(e) => setNewItem({ ...newItem, vegNonVeg: e.target.value as 'Veg' | 'Non-Veg' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Category *</label>
            <input
              type="text"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Biryani"
              list="categories"
            />
            <datalist id="categories">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description (optional)</label>
            <textarea
              value={newItem.description || ''}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Brief description..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addItem}
              disabled={!newItem.itemName || !newItem.category || newItem.price <= 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal with Summary */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Changes"
        variant="confirm"
        onConfirm={saveChanges}
        confirmText={saving ? 'Saving...' : 'Save All Changes'}
      >
        <div className="space-y-4">
          <p className="text-slate-600">Review your changes before saving:</p>
          
          {summary.edits.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="font-bold text-blue-800 mb-2">📝 Edited ({summary.edits.length})</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {summary.edits.map((change, i) => (
                  <li key={i}>
                    <strong>{change.item.itemName}</strong>
                    {change.field === 'price' && change.originalItem && (
                      <span> - Price: ₹{change.originalItem.price} → ₹{change.item.price}</span>
                    )}
                    {change.field === 'itemName' && change.originalItem && (
                      <span> - Name changed from "{change.originalItem.itemName}"</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.adds.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-bold text-green-800 mb-2">➕ Added ({summary.adds.length})</h4>
              <ul className="text-sm text-green-700 space-y-1">
                {summary.adds.map((change, i) => (
                  <li key={i}>
                    <strong>{change.item.itemName}</strong> - ₹{change.item.price} ({change.item.category})
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.deletes.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <h4 className="font-bold text-red-800 mb-2">🗑️ Deleted ({summary.deletes.length})</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {summary.deletes.map((change, i) => (
                  <li key={i}>
                    <strong>{change.item.itemName}</strong> - ₹{change.item.price}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {summary.toggles.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="font-bold text-yellow-800 mb-2">🔄 Toggled ({summary.toggles.length})</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {summary.toggles.map((change, i) => (
                  <li key={i}>
                    <strong>{change.item.itemName}</strong> - {change.item.inStock ? 'Enabled' : 'Disabled'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.refresh();
        }}
        title="Changes Saved!"
        variant="success"
      >
        <div className="text-center py-4">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-slate-600">
            Menu has been updated successfully. Changes are now live on the restaurant page.
          </p>
        </div>
      </Modal>
    </div>
  );
}
