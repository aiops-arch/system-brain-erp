/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Phone, Calendar, User, Clock, MessageSquare, Zap, Send, History, LayoutDashboard, BarChart3 } from 'lucide-react';
import { Lead, LeadStage, LeadTemp, ActivityLog, WASequence, ReminderTemplate, ReminderConfig, UserProfile } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CRMAutomation } from './CRMAutomation';
import { toast } from 'sonner';

interface CRMViewProps {
  leads: Lead[];
  globalAutoReminder: boolean;
  sequences: WASequence[];
  reminderConfig: ReminderConfig;
  reminderTemplates: ReminderTemplate[];
  users: UserProfile[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onAddLead: () => void;
  onToggleGlobalAutomation: (enabled: boolean) => void;
  onToggleSequence: (id: string, enabled: boolean) => void;
  onUpdateReminderConfig: (config: ReminderConfig) => void;
  onUpdateTemplate: (id: string, updates: Partial<ReminderTemplate>) => void;
  onUpdateSequence: (id: string, updates: Partial<WASequence>) => void;
}

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-500' },
  { id: 'requirement_collected', label: 'Req. Collected', color: 'bg-amber-500' },
  { id: 'quote_sent', label: 'Quote Sent', color: 'bg-purple-500' },
  { id: 'approved', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-slate-500' },
];

export const CRMView: React.FC<CRMViewProps> = ({ 
  leads, 
  globalAutoReminder, 
  sequences, 
  reminderConfig,
  reminderTemplates,
  users,
  onUpdateLead, 
  onUpdateUser,
  onAddLead, 
  onToggleGlobalAutomation, 
  onToggleSequence,
  onUpdateReminderConfig,
  onUpdateTemplate,
  onUpdateSequence
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [filterToday, setFilterToday] = useState(false);

  const handleWhatsApp = (lead: Lead) => {
    if (!lead.phone) {
      toast.error('No phone number available for this lead');
      return;
    }
    const cleanPhone = lead.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      toast.error('Invalid phone number');
      return;
    }
    const message = encodeURIComponent(`Hello ${lead.client}, this is from Offside Machine Shops regarding your inquiry for ${lead.type}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const filteredLeads = filterToday ? leads.filter(l => isToday(l.followup)) : leads;

  const getLeadsByStage = (stage: LeadStage) => filteredLeads.filter(l => l.stage === stage);

  const getTempBadge = (temp: LeadTemp) => {
    switch (temp) {
      case 'hot': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px]">Hot</Badge>;
      case 'warm': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">Warm</Badge>;
      case 'cold': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px]">Cold</Badge>;
    }
  };

  const handleAssignLead = (leadId: string) => {
    // Filter active users who are managers or admins (or specifically in Sales department if we want to be strict)
    const availableAgents = users.filter(u => u.status === 'active' && (u.role === 'manager' || u.role === 'admin'));
    
    if (availableAgents.length === 0) {
      toast.error('No active agents available for assignment');
      return;
    }

    // Round-robin based on current lead count (assign to the one with the least leads)
    const sortedAgents = [...availableAgents].sort((a, b) => a.currentLeadCount - b.currentLeadCount);
    const bestAgent = sortedAgents[0];

    onUpdateLead(leadId, { assignedTo: bestAgent.name });
    onUpdateUser(bestAgent.id, { currentLeadCount: bestAgent.currentLeadCount + 1 });
    
    toast.success(`Lead assigned to ${bestAgent.name}`, {
      description: `Current workload: ${bestAgent.currentLeadCount + 1} leads`
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="bg-slate-100/50">
          <TabsTrigger value="pipeline" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Zap className="w-4 h-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>
        {activeTab === 'pipeline' && (
          <div className="flex items-center gap-3">
            <Button 
              variant={filterToday ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterToday(!filterToday)}
              className="gap-2 h-9"
            >
              <Calendar className="w-4 h-4" />
              {filterToday ? "Showing Today's Follow-ups" : "Filter: Today's Follow-up"}
              {filterToday && <Badge className="ml-1 bg-white text-blue-600 border-none h-5 px-1.5">{filteredLeads.length}</Badge>}
            </Button>
            <Button onClick={onAddLead} className="gap-2 h-9">
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        )}
      </div>

      <TabsContent value="pipeline" className="space-y-6 m-0">
        <div className="grid grid-cols-5 gap-4">
          {STAGES.map(stage => (
            <Card key={stage.id} className="bg-white/50 border-none shadow-none">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stage.label}</span>
                <span className="text-lg font-bold">{getLeadsByStage(stage.id).length}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 h-[calc(100vh-280px)] overflow-hidden">
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => (
              <div key={stage.id} className="flex-1 min-w-[280px] flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                    <h3 className="text-sm font-semibold">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{getLeadsByStage(stage.id).length}</Badge>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-3">
                    {getLeadsByStage(stage.id).map(lead => {
                      const isOverdue = new Date(lead.followup) < new Date() && stage.id !== 'approved' && stage.id !== 'lost';
                      return (
                        <Card 
                          key={lead.id} 
                          onClick={() => setSelectedLead(lead)}
                          className={`group cursor-pointer hover:border-blue-300 transition-all ${isOverdue ? 'border-red-200 bg-red-50/30' : ''} ${selectedLead?.id === lead.id ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                        >
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="text-[10px] font-mono text-slate-400">{lead.id} · {lead.createdBy}</div>
                                <h4 className="text-sm font-bold leading-tight">{lead.client}</h4>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWhatsApp(lead);
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={(props) => (
                                      <Button 
                                        {...props}
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          props.onClick?.(e);
                                        }}
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    )}
                                  />
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleWhatsApp(lead)} className="text-green-600 font-medium gap-2">
                                      <MessageSquare className="w-4 h-4" /> WhatsApp Message
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAssignLead(lead.id)}>Auto-Assign (Round Robin)</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onUpdateLead(lead.id, { stage: 'requirement_collected' })}>Requirement Collected</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onUpdateLead(lead.id, { stage: 'approved' })}>Mark Won</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onUpdateLead(lead.id, { stage: 'lost' })}>Mark Lost</DropdownMenuItem>
                                    <Separator className="my-1" />
                                    <DropdownMenuItem className="text-blue-600 font-medium">Create Quotation</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-[9px] font-normal py-0 px-1.5 h-4">{lead.type}</Badge>
                              {lead.activityLogs?.filter(log => log.type === 'whatsapp').length > 0 && (
                                <Badge className="bg-green-100 text-green-700 border-none text-[9px] h-4 gap-1">
                                  <MessageSquare className="w-2.5 h-2.5" /> 
                                  {(() => {
                                    const waLogs = lead.activityLogs.filter(l => l.type === 'whatsapp');
                                    const lastWA = new Date(waLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp);
                                    const diffMins = Math.round((new Date().getTime() - lastWA.getTime()) / (1000 * 60));
                                    if (diffMins < 60) return `${diffMins}m ago`;
                                    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
                                    return lastWA.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                  })()}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold">₹{(lead.value / 1000).toFixed(0)}k</div>
                              {getTempBadge(lead.temp)}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-medium pt-2 border-t border-slate-50">
                              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                <Clock className="w-3 h-3" />
                                {isOverdue ? `Overdue ${Math.round((new Date().getTime() - new Date(lead.followup).getTime()) / (1000 * 60 * 60 * 24))}d` : new Date(lead.followup).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <User className="w-3 h-3" />
                                {lead.assignedTo || 'Unassigned'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {stage.id === 'new' && (
                      <button 
                        onClick={onAddLead}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium hover:border-slate-300 hover:text-slate-500 transition-all"
                      >
                        + Add lead
                      </button>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>

          {/* Lead Detail Sidebar (Conditional) */}
          {selectedLead && (
            <Card className="w-[380px] shrink-0 border-l shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
              <CardHeader className="pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Lead Details</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                    <Plus className="w-4 h-4 rotate-45" />
                  </Button>
                </div>
                <CardDescription>{selectedLead.client} · {selectedLead.id}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
                <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-100 flex flex-col gap-3 shrink-0">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{selectedLead.phone}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-white">Primary Contact</Badge>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Assigned to: {selectedLead.assignedTo || 'Unassigned'}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(props) => (
                          <Button {...props} variant="ghost" size="sm" className="h-6 text-[10px] px-2">Change</Button>
                        )}
                      />
                      <DropdownMenuContent align="end">
                        {users.filter(u => u.status === 'active').map(user => (
                          <DropdownMenuItem key={user.id} onClick={() => {
                            onUpdateLead(selectedLead.id, { assignedTo: user.name });
                            onUpdateUser(user.id, { currentLeadCount: user.currentLeadCount + 1 });
                            setSelectedLead({ ...selectedLead, assignedTo: user.name });
                            toast.success(`Assigned to ${user.name}`);
                          }}>
                            {user.name} ({user.currentLeadCount} leads)
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 gap-2 flex-1"
                      onClick={() => handleWhatsApp(selectedLead)}
                    >
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2 flex-1"
                      onClick={() => handleCall(selectedLead.phone)}
                    >
                      <Phone className="w-4 h-4" /> Call
                    </Button>
                  </div>
                </div>

                <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-amber-50/30 shrink-0">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold">Auto WhatsApp Reminders</span>
                  </div>
                  <Switch 
                    checked={selectedLead.autoReminder} 
                    onCheckedChange={(checked) => {
                      onUpdateLead(selectedLead.id, { autoReminder: checked });
                      setSelectedLead({ ...selectedLead, autoReminder: checked });
                    }}
                  />
                </div>
                
                <Tabs defaultValue="activity" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="mx-6 mt-4 w-fit shrink-0">
                    <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                    <TabsTrigger value="whatsapp" className="text-xs">WhatsApp</TabsTrigger>
                    <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="flex-1 p-0 mt-4 overflow-hidden">
                    <ScrollArea className="h-full px-6">
                      <div className="space-y-6 relative pb-8 before:absolute before:left-[11px] before:top-2 before:bottom-8 before:w-px before:bg-slate-100">
                        {selectedLead.activityLogs?.map((log, i) => (
                          <div key={log.id} className="relative pl-8">
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10">
                              {log.type === 'whatsapp' ? <MessageSquare className="w-3 h-3 text-green-600" /> : <History className="w-3 h-3 text-slate-400" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-400">{log.type}</span>
                                <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs text-slate-700">{log.content}</p>
                              <div className="text-[10px] text-slate-400 italic">By {log.performedBy}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="whatsapp" className="flex-1 p-6 space-y-4 overflow-hidden flex flex-col">
                    <div className="bg-slate-50 rounded-lg p-4 flex-1 flex flex-col overflow-hidden">
                      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                        <div className="bg-white p-2 rounded-lg text-xs shadow-sm max-w-[80%]">
                          Hello, I'm interested in your fabrication services.
                        </div>
                        <div className="bg-blue-600 text-white p-2 rounded-lg text-xs shadow-sm max-w-[80%] self-end">
                          Sure! We've sent our brochure. How can we help?
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2 shrink-0">
                        <input className="flex-1 bg-white border rounded px-3 py-2 text-xs" placeholder="Type a message..." />
                        <Button size="icon" className="h-8 w-8 bg-blue-600"><Send className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="automation" className="m-0">
        <CRMAutomation 
          globalAutoReminder={globalAutoReminder} 
          sequences={sequences}
          reminderConfig={reminderConfig}
          reminderTemplates={reminderTemplates}
          onToggleGlobal={onToggleGlobalAutomation} 
          onToggleSequence={onToggleSequence}
          onUpdateReminderConfig={onUpdateReminderConfig}
          onUpdateTemplate={onUpdateTemplate}
          onUpdateSequence={onUpdateSequence}
        />
      </TabsContent>

      <TabsContent value="analytics" className="m-0">
        <Card>
          <CardHeader>
            <CardTitle>Lead Funnel Performance</CardTitle>
            <CardDescription>Real-time conversion tracking across stages.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-slate-400 italic">
            Analytics visualization loading...
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
