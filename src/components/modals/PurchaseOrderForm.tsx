/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurchaseOrder, Supplier, InventoryItem, PurchaseOrderItem } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PurchaseOrderFormProps {
  suppliers: Supplier[];
  inventory: InventoryItem[];
  initialData?: Partial<PurchaseOrder>;
  onSubmit: (data: Partial<PurchaseOrder>) => void;
  onCancel: () => void;
}

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ 
  suppliers, 
  inventory, 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>(initialData || {
    supplierId: '',
    items: [],
    totalAmount: 0,
    status: 'draft',
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert('Please select a supplier');
      return;
    }
    // Calculate total amount before submitting
    const total = formData.items?.reduce((sum, item) => sum + (item.qty * item.rate * (1 + item.gst / 100)), 0) || 0;
    onSubmit({ ...formData, totalAmount: total });
  };

  const updateItem = (index: number, updates: Partial<PurchaseOrderItem>) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], ...updates };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="supplier">Select Supplier</Label>
        <Select 
          onValueChange={(val) => setFormData({ ...formData, supplierId: val })}
          value={formData.supplierId || ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a supplier" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.id})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-semibold">Items from Request</Label>
        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
          {formData.items?.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md bg-white">
              <div className="col-span-4 space-y-1">
                <Label className="text-[10px]">Item Name</Label>
                <Input value={item.name} readOnly className="h-8 text-xs bg-slate-50" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[10px]">Qty</Label>
                <Input 
                  type="number" 
                  value={item.qty} 
                  onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-[10px]">Rate (₹)</Label>
                <Input 
                  type="number" 
                  value={item.rate} 
                  onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-[10px]">GST (%)</Label>
                <Input 
                  type="number" 
                  value={item.gst} 
                  onChange={(e) => updateItem(idx, { gst: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedDelivery">Expected Delivery</Label>
        <Input 
          id="expectedDelivery" 
          type="date" 
          value={formData.expectedDelivery?.split('T')[0]} 
          onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })} 
        />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create PO Draft</Button>
      </div>
    </form>
  );
};
