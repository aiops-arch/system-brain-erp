/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Zap, Plus, Trash2, Play, Pause, Settings2, MessageSquare } from 'lucide-react';
import { AutomationRule, WASequence, ReminderTemplate, ReminderConfig } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CRMAutomationProps {
  globalAutoReminder: boolean;
  sequences: WASequence[];
  reminderConfig: ReminderConfig;
  reminderTemplates: ReminderTemplate[];
  onToggleGlobal: (enabled: boolean) => void;
  onToggleSequence: (id: string, enabled: boolean) => void;
  onUpdateReminderConfig: (config: ReminderConfig) => void;
  onUpdateTemplate: (id: string, updates: Partial<ReminderTemplate>) => void;
  onUpdateSequence: (id: string, updates: Partial<WASequence>) => void;
}

export const CRMAutomation: React.FC<CRMAutomationProps> = ({ 
  globalAutoReminder, 
  sequences, 
  reminderConfig, 
  reminderTemplates, 
  onToggleGlobal, 
  onToggleSequence,
  onUpdateReminderConfig,
  onUpdateTemplate,
  onUpdateSequence
}) => {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'R1',
      name: 'Instant WhatsApp Welcome',
      trigger: 'lead_created',
      conditions: [],
      actions: [{ type: 'send_whatsapp', params: { template: 'welcome_msg' } }],
      isActive: true
    },
    {
      id: 'R2',
      name: 'SLA Breach Notification',
      trigger: 'inactive_hours',
      conditions: [{ field: 'hours', operator: 'greater_than', value: 24 }],
      actions: [{ type: 'notify_manager', params: { message: 'Lead inactive for 24h' } }],
      isActive: false
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Automation Engine
          </h2>
          <p className="text-slate-500 text-sm">Design rule-based triggers and drip sequences to eliminate lead leakage.</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-slate-100/50 p-1 rounded-lg">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="rules" className="text-xs">Rules</TabsTrigger>
              <TabsTrigger value="sequences" className="text-xs">Sequences</TabsTrigger>
              <TabsTrigger value="reminders" className="text-xs">Reminders</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {activeTab === 'rules' ? 'Create Rule' : 'Create Sequence'}
          </Button>
        </div>
      </div>

      <TabsContent value="rules" className="m-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-amber-200 bg-amber-50/10">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${globalAutoReminder ? 'bg-amber-500' : 'bg-slate-300'}`} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Overdue Follow-up Reminder
              </CardTitle>
              <Switch checked={globalAutoReminder} onCheckedChange={onToggleGlobal} />
            </div>
            <CardDescription>
              Automatically send WhatsApp reminders when a lead's follow-up date has passed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-amber-100">
              <p className="font-bold mb-1">Logic:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80">
                <li>Trigger: Follow-up date is in the past</li>
                <li>Action: Send "Follow-up Reminder" template</li>
                <li>Frequency: Max once per 24 hours</li>
                <li>Scope: Only leads with "Auto-Reminder" enabled</li>
              </ul>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>System-level automation</span>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-none">High Priority</Badge>
            </div>
          </CardContent>
        </Card>

        {rules.map(rule => (
          <Card key={rule.id} className="relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${rule.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <Switch checked={rule.isActive} />
              </div>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] uppercase">{rule.trigger?.replace('_', ' ') || rule.trigger}</Badge>
                {rule.isActive ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                    <Play className="w-3 h-3 fill-current" /> Running
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Pause className="w-3 h-3 fill-current" /> Paused
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Conditions</div>
                {rule.conditions.length > 0 ? (
                  rule.conditions.map((c, i) => (
                    <div key={i} className="text-xs bg-slate-50 p-2 rounded border border-slate-100">
                      IF <span className="font-bold">{c.field}</span> {c.operator.replace('_', ' ')} <span className="font-bold">{c.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">No conditions (Always triggers)</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Actions</div>
                {rule.actions.map((a, i) => (
                  <div key={i} className="text-xs bg-blue-50 text-blue-700 p-2 rounded border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      {a.type?.replace('_', ' ') || a.type}
                    </div>
                    <span className="text-[10px] font-mono opacity-70">{JSON.stringify(a.params)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between pt-2">
                <div className="text-[10px] text-slate-400">Last triggered: 2 hours ago</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </TabsContent>

      <TabsContent value="sequences" className="m-0 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {sequences.map(seq => (
            <Card key={seq.id} className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${seq.isActive ? 'bg-blue-500' : 'bg-slate-300'}`} />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      {seq.name}
                    </CardTitle>
                    <CardDescription>Drip campaign for nurturing new leads over 7 days.</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Active Leads</div>
                      <div className="text-lg font-bold">24</div>
                    </div>
                    <Switch checked={seq.isActive} onCheckedChange={(val) => onToggleSequence(seq.id, val)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative pl-8 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {seq.steps.map((step, i) => (
                    <div key={step.id} className="relative">
                      <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500 z-10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold">Delay</Badge>
                            <Input 
                              type="number" 
                              className="w-16 h-7 text-xs" 
                              value={step.delayDays}
                              onChange={(e) => {
                                const newSteps = [...seq.steps];
                                newSteps[i] = { ...step, delayDays: parseInt(e.target.value) || 0 };
                                onUpdateSequence(seq.id, { steps: newSteps });
                              }}
                            />
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Days</span>
                            <Separator orientation="vertical" className="h-4 mx-2" />
                            <Input 
                              className="h-7 text-xs font-bold flex-1" 
                              value={step.templateName}
                              onChange={(e) => {
                                const newSteps = [...seq.steps];
                                newSteps[i] = { ...step, templateName: e.target.value };
                                onUpdateSequence(seq.id, { steps: newSteps });
                              }}
                              placeholder="Step Name"
                            />
                          </div>
                          <Textarea 
                            className="text-xs min-h-[60px] bg-white" 
                            value={step.content}
                            onChange={(e) => {
                              const newSteps = [...seq.steps];
                              newSteps[i] = { ...step, content: e.target.value };
                              onUpdateSequence(seq.id, { steps: newSteps });
                            }}
                            placeholder="Message content..."
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              const newSteps = seq.steps.filter((_, idx) => idx !== i);
                              onUpdateSequence(seq.id, { steps: newSteps });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-0 border-dashed gap-2"
                    onClick={() => {
                      const newStep = {
                        id: `S${Date.now()}`,
                        delayDays: 1,
                        templateName: 'New Step',
                        content: 'New message content'
                      };
                      onUpdateSequence(seq.id, { steps: [...seq.steps, newStep] });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reminders" className="m-0 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Reminder Settings</CardTitle>
              <CardDescription>Configure how often reminders are sent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interval">Interval (Days)</Label>
                <Input 
                  id="interval" 
                  type="number" 
                  min="1" 
                  value={reminderConfig.intervalDays} 
                  onChange={(e) => onUpdateReminderConfig({ ...reminderConfig, intervalDays: parseInt(e.target.value) || 1 })}
                />
                <p className="text-[10px] text-slate-400">Reminders will be sent every X days after the follow-up date is passed.</p>
              </div>
              <div className="space-y-2">
                <Label>Active Template</Label>
                <Select 
                  value={reminderConfig.templateId} 
                  onValueChange={(val) => onUpdateReminderConfig({ ...reminderConfig, templateId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 px-1">WhatsApp Templates</h3>
            {reminderTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {reminderConfig.templateId === template.id && (
                      <Badge className="bg-blue-100 text-blue-700 border-none">Active</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Message Content</Label>
                    <Textarea 
                      className="text-xs min-h-[80px]" 
                      value={template.content} 
                      onChange={(e) => onUpdateTemplate(template.id, { content: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full border-dashed gap-2">
              <Plus className="w-4 h-4" />
              Add New Template
            </Button>
          </div>
        </div>
      </TabsContent>
    </div>
  );
};
