/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketingProject, ContentType, MarketingGoal, ContentFormat, SafetyLevel } from '../../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface MarketingRequestFormProps {
  onSubmit: (data: Partial<MarketingProject>) => void;
  onCancel: () => void;
}

export const MarketingRequestForm: React.FC<MarketingRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    highlights: '',
    primaryGoal: 'portfolio' as MarketingGoal,
    requiredFormat: 'horizontal' as ContentFormat,
    onSiteContact: '',
    safetyLevel: 'standard' as SafetyLevel,
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    type: 'video' as ContentType,
    shootDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      deadline: new Date(formData.deadline).toISOString(),
      shootDate: new Date(formData.shootDate).toISOString(),
      status: 'planning',
      channels: [],
      safetyCheck: false,
      rawFootageSaved: false,
      equipmentCheck: false,
      assignedTo: 'Unassigned',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          required
          placeholder="e.g., S.S. Tank Fabrication for Pharma Client"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        <p className="text-[10px] text-slate-400">Used for file naming and tracking.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            required
            placeholder="e.g., Workshop Bay 2"
            value={formData.location}
            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">On-Site Contact</Label>
          <Input
            id="contact"
            required
            placeholder="Shop Floor Supervisor"
            value={formData.onSiteContact}
            onChange={e => setFormData(prev => ({ ...prev, onSiteContact: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="highlights">Key Highlights</Label>
        <Textarea
          id="highlights"
          required
          placeholder="e.g., MIG Welding, Final Polish, Size Scale"
          value={formData.highlights}
          onChange={e => setFormData(prev => ({ ...prev, highlights: e.target.value }))}
        />
        <p className="text-[10px] text-slate-400">Tells the team what the "Hero" shots are.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Primary Goal</Label>
          <Select 
            value={formData.primaryGoal} 
            onValueChange={(val: MarketingGoal) => setFormData(prev => ({ ...prev, primaryGoal: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portfolio">Client Portfolio</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="safety">Safety Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Required Format</Label>
          <Select 
            value={formData.requiredFormat} 
            onValueChange={(val: ContentFormat) => setFormData(prev => ({ ...prev, requiredFormat: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vertical">Vertical (Reels/Shorts)</SelectItem>
              <SelectItem value="horizontal">Horizontal (YouTube/TV)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Safety Level</Label>
          <Select 
            value={formData.safetyLevel} 
            onValueChange={(val: SafetyLevel) => setFormData(prev => ({ ...prev, safetyLevel: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="high_risk">High-Risk (Sparks/Lifting)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline (First Draft)</Label>
          <Input
            id="deadline"
            type="date"
            required
            value={formData.deadline}
            onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Content Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(val: ContentType) => setFormData(prev => ({ ...prev, type: val }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shootDate">Requested Shoot Date</Label>
          <Input
            id="shootDate"
            type="date"
            required
            value={formData.shootDate}
            onChange={e => setFormData(prev => ({ ...prev, shootDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Submit Request</Button>
      </div>
    </form>
  );
};
