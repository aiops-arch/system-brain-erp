import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Gauge, ListChecks, Play, Plus, RotateCcw, Send, Trophy, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DesignerBid, DesignerGrade, DesignerProfile, DesignerProject, DesignerProjectPriority, DesignerWorkflowEvent } from '../types';

interface DesignerWorkflowViewProps {
  projects: DesignerProject[];
  designers: DesignerProfile[];
  bids: DesignerBid[];
  events: DesignerWorkflowEvent[];
  onCreateProject: (input: {
    name: string;
    client: string;
    description: string;
    grade: DesignerGrade;
    priority: DesignerProjectPriority;
    estimatedHours: number;
  }) => void;
  onRunAutomation: () => void;
}

const statusLabels: Record<DesignerProject['status'], string> = {
  created: 'Created',
  published_for_bidding: 'Published',
  bidding_closed: 'Bids Closed',
  auto_allocated: 'Allocated',
  in_progress: 'In Progress',
  designer_submitted: 'Submitted',
  sales_auto_review: 'Auto Review',
  sent_to_client: 'Sent',
  client_review: 'Client Review',
  revision_required: 'Revision',
  completed: 'Completed'
};

const pipeline = [
  { id: 'created', label: 'Intake', icon: Plus },
  { id: 'published_for_bidding', label: 'Bidding', icon: Users },
  { id: 'auto_allocated', label: 'Assigned', icon: Zap },
  { id: 'in_progress', label: 'Work', icon: Clock },
  { id: 'sales_auto_review', label: 'Review', icon: ListChecks },
  { id: 'client_review', label: 'Client', icon: Send },
  { id: 'completed', label: 'Done', icon: CheckCircle2 }
];

const statusToColumn = (status: DesignerProject['status']) => {
  if (status === 'created') return 'created';
  if (status === 'published_for_bidding' || status === 'bidding_closed') return 'published_for_bidding';
  if (status === 'auto_allocated') return 'auto_allocated';
  if (status === 'in_progress' || status === 'designer_submitted' || status === 'revision_required') return 'in_progress';
  if (status === 'sales_auto_review' || status === 'sent_to_client') return 'sales_auto_review';
  if (status === 'client_review') return 'client_review';
  return 'completed';
};

const progressForStatus = (status: DesignerProject['status']) => {
  const order: DesignerProject['status'][] = [
    'created',
    'published_for_bidding',
    'bidding_closed',
    'auto_allocated',
    'in_progress',
    'designer_submitted',
    'sales_auto_review',
    'sent_to_client',
    'client_review',
    'completed'
  ];
  if (status === 'revision_required') return 58;
  const index = order.indexOf(status);
  return Math.max(8, Math.round(((index + 1) / order.length) * 100));
};

const gradeClass: Record<DesignerGrade, string> = {
  A: 'bg-green-100 text-green-700 border-green-200',
  B: 'bg-amber-100 text-amber-700 border-amber-200',
  C: 'bg-red-100 text-red-700 border-red-200'
};

export const DesignerWorkflowView: React.FC<DesignerWorkflowViewProps> = ({
  projects,
  designers,
  bids,
  events,
  onCreateProject,
  onRunAutomation
}) => {
  const [form, setForm] = useState({
    name: 'New Shop Drawing',
    client: 'New Client',
    description: 'Prepare client-ready design output with dimensions, material notes, and revision-safe deliverables.',
    grade: 'B' as DesignerGrade,
    priority: 'medium' as DesignerProjectPriority,
    estimatedHours: 10
  });

  const activeProjects = projects.filter(project => project.status !== 'completed');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const revisionCount = projects.reduce((sum, project) => sum + project.revisionCount, 0);
  const avgFirstApproval = designers.length
    ? Math.round(designers.reduce((sum, designer) => sum + designer.firstApprovalRate, 0) / designers.length)
    : 0;

  const eventRows = useMemo(
    () => [...events].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 12),
    [events]
  );

  const handleCreate = () => {
    if (!form.name.trim() || !form.client.trim()) {
      toast.error('Project name and client are required');
      return;
    }
    onCreateProject(form);
  };

  const getDesignerName = (id: string | null) => designers.find(designer => designer.id === id)?.name || 'Unassigned';
  const getSelectedBid = (project: DesignerProject) => bids.find(bid => bid.id === project.selectedBidId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Gauge className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">No-human designer workflow</span>
                </div>
                <CardTitle>Sales Intake to Client Approval</CardTitle>
                <CardDescription>
                  Create the project once; the system handles bidding, allocation, review, revision routing, and performance updates.
                </CardDescription>
              </div>
              <Button onClick={onRunAutomation} className="gap-2">
                <Play className="w-4 h-4" />
                Run Automation Cycle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Work</div>
                <div className="text-2xl font-bold mt-1">{activeProjects.length}</div>
              </div>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Auto Bids</div>
                <div className="text-2xl font-bold text-indigo-700 mt-1">{bids.length}</div>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Revisions</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{revisionCount}</div>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-green-600">First Approval</div>
                <div className="text-2xl font-bold text-green-700 mt-1">{avgFirstApproval}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Project Intake</CardTitle>
            <CardDescription>One sales entry starts the full automatic designer flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              placeholder="Project name"
            />
            <input
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.client}
              onChange={event => setForm(prev => ({ ...prev, client: event.target.value }))}
              placeholder="Client"
            />
            <textarea
              className="min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={form.description}
              onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
              placeholder="Design brief"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.grade}
                onChange={event => setForm(prev => ({ ...prev, grade: event.target.value as DesignerGrade }))}
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
              <select
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={form.priority}
                onChange={event => setForm(prev => ({ ...prev, priority: event.target.value as DesignerProjectPriority }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                type="number"
                min={4}
                value={form.estimatedHours}
                onChange={event => setForm(prev => ({ ...prev, estimatedHours: Number(event.target.value) }))}
              />
            </div>
            <Button onClick={handleCreate} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create and Automate
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-7 gap-3">
        {pipeline.map(column => {
          const rows = projects.filter(project => statusToColumn(project.status) === column.id);
          return (
            <Card key={column.id} className="min-h-[320px]">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className="w-4 h-4 text-slate-500" />
                    <CardTitle className="text-sm">{column.label}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{rows.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                {rows.map(project => {
                  const selectedBid = getSelectedBid(project);
                  return (
                    <div key={project.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">{project.id}</div>
                          <div className="text-sm font-bold leading-tight">{project.name}</div>
                          <div className="text-[11px] text-slate-500">{project.client}</div>
                        </div>
                        <Badge variant="outline" className={gradeClass[project.grade]}>{project.grade}</Badge>
                      </div>
                      <Progress value={progressForStatus(project.status)} className="h-1.5" />
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{statusLabels[project.status]}</span>
                        <span>{getDesignerName(project.assignedDesignerId)}</span>
                      </div>
                      {selectedBid && (
                        <div className="rounded-md bg-slate-50 p-2 text-[10px] text-slate-600">
                          Selected bid: {selectedBid.bidHours} hrs, score {selectedBid.score}
                        </div>
                      )}
                      {project.revisionCount > 0 && (
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <RotateCcw className="w-3 h-3" />
                          {project.revisionCount} revision
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Designer Performance</CardTitle>
            <CardDescription>Metrics update automatically when projects complete.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...designers].sort((a, b) => b.rating - a.rating).map(designer => (
              <div key={designer.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold">{designer.name}</div>
                    <div className="text-[11px] text-slate-500">Grades {designer.grades.join(', ')} · workload {designer.workload}</div>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700 border-none gap-1">
                    <Trophy className="w-3 h-3" />
                    {designer.rating}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-sm font-bold">{designer.onTimeRate}%</div>
                    <div className="text-[9px] text-slate-400 uppercase">On time</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-sm font-bold">{designer.firstApprovalRate}%</div>
                    <div className="text-[9px] text-slate-400 uppercase">First pass</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <div className="text-sm font-bold">{designer.avgCompletionHours}h</div>
                    <div className="text-[9px] text-slate-400 uppercase">Avg time</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(['A', 'B', 'C'] as DesignerGrade[]).map(grade => (
                    <Badge key={grade} variant="outline" className="text-[10px]">
                      {grade}: {designer.gradeWiseCompleted[grade]}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automation Event Log</CardTitle>
            <CardDescription>Latest system decisions and routing actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-4">
                {eventRows.map((row, index) => (
                  <div key={row.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{row.label}</span>
                          <Badge variant="outline" className="text-[10px]">{row.projectId}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{row.detail}</p>
                        <div className="text-[10px] text-slate-400">{new Date(row.created).toLocaleString()}</div>
                      </div>
                    </div>
                    {index < eventRows.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {completedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Designer Work</CardTitle>
            <CardDescription>Final jobs closed by client approval or auto-approval timeout.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {completedProjects.slice(0, 6).map(project => (
              <div key={project.id} className="rounded-lg border border-green-100 bg-green-50 p-4">
                <div className="text-[10px] font-mono text-green-700">{project.id}</div>
                <div className="font-bold">{project.name}</div>
                <div className="text-xs text-green-700 mt-1">{project.client}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
