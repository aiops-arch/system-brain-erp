/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lead, LeadTemp } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LeadFormProps {
  onSubmit: (data: Partial<Lead>) => void;
  onCancel: () => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    type: '',
    value: '',
    temp: 'warm' as LeadTemp,
    followup: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value),
      followup: new Date(formData.followup).toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client">Client Name</Label>
          <input
            id="client"
            required
            className="w-full bg-white border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Patel Construction"
            value={formData.client}
            onChange={e => setFormData(prev => ({ ...prev, client: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <input
            id="phone"
            required
            className="w-full bg-white border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="+91 98000-00000"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Project Type</Label>
          <input
            id="type"
            required
            className="w-full bg-white border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. MS Gate + Railing"
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Estimated Value (₹)</Label>
          <input
            id="value"
            type="number"
            required
            className="w-full bg-white border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. 250000"
            value={formData.value}
            onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lead Temperature</Label>
          <Select 
            value={formData.temp} 
            onValueChange={(val: LeadTemp) => setFormData(prev => ({ ...prev, temp: val }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select temperature" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="warm">☀️ Warm</SelectItem>
              <SelectItem value="cold">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="followup">Next Follow-up</Label>
          <input
            id="followup"
            type="date"
            required
            className="w-full bg-white border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.followup}
            onChange={e => setFormData(prev => ({ ...prev, followup: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Lead</Button>
      </div>
    </form>
  );
};
