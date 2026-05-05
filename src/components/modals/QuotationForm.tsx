/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Quotation, Lead } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface QuotationFormProps {
  leads: Lead[];
  initialData?: Partial<Quotation>;
  onSubmit: (data: Partial<Quotation>) => void;
  onCancel: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ leads, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Quotation>>(initialData || {
    client: '',
    type: '',
    material: 0,
    labour: 0,
    margin: 20,
    version: 1,
    status: 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.client?.trim()) {
      newErrors.client = 'Client name is required';
    }
    if (!formData.leadId) {
      newErrors.leadId = 'Please select a lead';
    }
    if ((formData.material || 0) <= 0) {
      newErrors.material = 'Material cost must be greater than 0';
    }
    if ((formData.labour || 0) <= 0) {
      newErrors.labour = 'Labour cost must be greater than 0';
    }
    if ((formData.margin || 0) < 0 || (formData.margin || 0) > 100) {
      newErrors.margin = 'Margin must be between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="lead">Select Lead</Label>
        <Select 
          onValueChange={(val) => {
            const lead = leads.find(l => l.id === val);
            if (lead) setFormData({ ...formData, leadId: val, client: lead.client, type: lead.type });
          }}
          value={formData.leadId || ""}
        >
          <SelectTrigger className={errors.leadId ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a lead" />
          </SelectTrigger>
          <SelectContent>
            {leads.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.client} ({l.id})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.leadId && <p className="text-xs text-red-500">{errors.leadId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="material">Material Cost (₹)</Label>
          <Input 
            id="material" 
            type="number" 
            value={formData.material} 
            onChange={(e) => setFormData({ ...formData, material: Number(e.target.value) })} 
            className={errors.material ? 'border-red-500' : ''}
          />
          {errors.material && <p className="text-xs text-red-500">{errors.material}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="labour">Labour Cost (₹)</Label>
          <Input 
            id="labour" 
            type="number" 
            value={formData.labour} 
            onChange={(e) => setFormData({ ...formData, labour: Number(e.target.value) })} 
            className={errors.labour ? 'border-red-500' : ''}
          />
          {errors.labour && <p className="text-xs text-red-500">{errors.labour}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="margin">Margin (%)</Label>
        <Input 
          id="margin" 
          type="number" 
          value={formData.margin} 
          onChange={(e) => setFormData({ ...formData, margin: Number(e.target.value) })} 
          className={errors.margin ? 'border-red-500' : ''}
        />
        {errors.margin && <p className="text-xs text-red-500">{errors.margin}</p>}
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Quotation</Button>
      </div>
    </form>
  );
};
