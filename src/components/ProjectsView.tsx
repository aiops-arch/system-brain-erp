/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, AlertTriangle, CheckCircle2, MoreVertical, CreditCard, FileText, Factory, ShieldCheck, Truck } from 'lucide-react';
import { Project } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProjectsViewProps {
  projects: Project[];
  onApproveDesign: (id: string) => void;
  onMarkAdvance: (id: string) => void;
  onNew: () => void;
  onManage: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  projects, 
  onApproveDesign, 
  onMarkAdvance, 
  onNew,
  onManage
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active</div>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Advance Pending</div>
            <div className="text-2xl font-bold text-red-600">{projects.filter(p => !p.advanceReceived && p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Design Pending</div>
            <div className="text-2xl font-bold text-amber-600">{projects.filter(p => !p.designApproved && p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{projects.filter(p => p.status === 'active' && new Date(p.deadline) < new Date()).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Active Projects</h3>
          <Button onClick={onNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {projects.map((project) => {
          const isOverdue = new Date(project.deadline) < new Date() && project.status === 'active';
          const barColor = isOverdue ? 'bg-red-500' : project.progress > 70 ? 'bg-green-500' : 'bg-blue-600';
          
          // Rule 28: Delay Prediction
          const daysLeft = Math.round((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const isAtRisk = daysLeft < 7 && project.progress < 50;
          
          const steps = [
            { id: 'advance', label: 'Advance', icon: CreditCard, completed: project.advanceReceived },
            { id: 'design', label: 'Design', icon: FileText, completed: project.designApproved },
            { id: 'production', label: 'Production', icon: Factory, completed: project.progress === 100 },
            { id: 'qc', label: 'QC', icon: ShieldCheck, completed: project.progress === 100 && project.status === 'completed' },
            { id: 'dispatch', label: 'Dispatch', icon: Truck, completed: project.status === 'completed' },
          ];
          
          return (
            <Card key={project.id} className={`overflow-hidden ${isOverdue ? 'border-red-200' : isAtRisk ? 'border-amber-200 shadow-amber-50 shadow-lg' : ''}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{project.id} · {project.client}</span>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>{project.status}</Badge>
                      {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                      {isAtRisk && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">High Risk</Badge>}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.type} · ₹{project.value.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onManage(project.id)}>Manage</Button>
                  </div>
                </div>

                {/* Lifecycle Tracker - Easy to Use */}
                <div className="mb-8">
                  <div className="relative flex justify-between">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                    {steps.map((step, idx) => (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          step.completed ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${step.completed ? 'text-green-600' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Progress</span>
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <Progress value={project.progress} className={`h-2 ${barColor}`} />
                    <div className="text-xs font-medium text-slate-600">{project.progress}% complete</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!project.advanceReceived && (
                      <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => onMarkAdvance(project.id)}>
                        Mark advance received
                      </Button>
                    )}
                    {!project.designApproved && (
                      <Button variant="outline" size="sm" className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => onApproveDesign(project.id)}>
                        Approve design
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
