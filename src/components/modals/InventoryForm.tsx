/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InventoryFormProps {
  initialData?: Partial<InventoryItem>;
  onSubmit: (data: Partial<InventoryItem>) => void;
  onCancel: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(initialData || {
    name: '',
    category: 'raw_material',
    qty: 0,
    unit: 'kg',
    threshold: 10,
    rate: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          placeholder="e.g. Mild Steel Plate 5mm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select 
            onValueChange={(val) => setFormData({ ...formData, category: val as any })}
            value={formData.category || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw_material">Raw Material</SelectItem>
              <SelectItem value="consumable">Consumable</SelectItem>
              <SelectItem value="tool">Tool</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input 
            id="unit" 
            value={formData.unit} 
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })} 
            placeholder="kg, pcs, mtr"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qty">Initial Quantity</Label>
          <Input 
            id="qty" 
            type="number" 
            value={formData.qty} 
            onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="threshold">Low Stock Threshold</Label>
          <Input 
            id="threshold" 
            type="number" 
            value={formData.threshold} 
            onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate">Rate (₹)</Label>
        <Input 
          id="rate" 
          type="number" 
          value={formData.rate} 
          onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })} 
        />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Item</Button>
      </div>
    </form>
  );
};
