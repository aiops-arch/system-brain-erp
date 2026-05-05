/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, AlertTriangle, CheckCircle2, Factory, User, Clock, Settings } from 'lucide-react';
import { Project, Task, TaskType } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { checkGates } from '../lib/store';

interface ProductionViewProps {
  projects: Project[];
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddTask: (projectId: string) => void;
  onOpenTask: (id: string) => void;
}

const TASK_TYPES: { id: TaskType; label: string; color: string; bg: string; text: string }[] = [
  { id: 'procurement', label: 'Procurement', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  { id: 'cutting', label: 'Cutting', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
  { id: 'welding', label: 'Welding', color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
  { id: 'finishing', label: 'Finishing', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  { id: 'qc', label: 'QC', color: 'bg-pink-500', bg: 'bg-pink-50', text: 'text-pink-700' },
];

export const ProductionView: React.FC<ProductionViewProps> = ({ 
  projects, 
  tasks, 
  onUpdateTask, 
  onAddTask,
  onOpenTask
}) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Active Tasks</div>
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'in_progress').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Blocked</div>
            <div className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status === 'blocked').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Completed Today</div>
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'done').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Overdue Tasks</div>
            <div className="text-2xl font-bold text-amber-600">{tasks.filter(t => t.status !== 'done' && new Date(t.due) < new Date()).length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {activeProjects.map((project) => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const gate = { ok: project.advanceReceived && project.designApproved, reason: !project.advanceReceived ? 'Advance pending' : 'Design pending' };
          const isOverdue = new Date(project.deadline) < new Date();

          return (
            <Card key={project.id} className={`${isOverdue ? 'border-red-200' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-bold">{project.id} · {project.client}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{project.type}</Badge>
                  </div>
                  <CardDescription className="text-[10px] font-medium uppercase tracking-wider">
                    Deadline: {new Date(project.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {project.progress}% · Designer: {project.designer}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {!gate.ok && (
                    <Badge variant="destructive" className="text-[10px] h-6 gap-1">
                      <AlertTriangle className="w-3 h-3" /> BLOCKED: {gate.reason}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => onAddTask(project.id)}>
                    <Plus className="w-3 h-3" /> Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {TASK_TYPES.map(type => {
                    const task = projectTasks.find(t => t.type === type.id);
                    if (!task) {
                      return (
                        <div key={type.id} className={`p-3 rounded-xl border border-dashed border-slate-200 ${type.bg}/30 opacity-40`}>
                          <div className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${type.text}`}>{type.label}</div>
                          <div className="text-[10px] text-slate-400">No task</div>
                        </div>
                      );
                    }

                    const isBlocked = !gate.ok && task.status === 'pending';
                    const isTaskOverdue = task.status !== 'done' && new Date(task.due) < new Date();

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => onOpenTask(task.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                          task.status === 'done' ? 'bg-green-50/50 border-green-100' : 
                          task.status === 'blocked' || isBlocked ? 'bg-red-50/50 border-red-200' : 
                          isTaskOverdue ? 'bg-amber-50/50 border-amber-200' :
                          `${type.bg} border-slate-200`
                        }`}
                      >
                        <div className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${type.text}`}>{type.label}</div>
                        <div className="text-xs font-bold mb-1 line-clamp-1">{task.title}</div>
                        <div className="text-[10px] text-slate-500 mb-3 flex items-center gap-1">
                          <User className="w-3 h-3" /> {task.assignee}
                        </div>
                        
                        <div className="space-y-1.5">
                          <Progress 
                            value={task.progress} 
                            className={`h-1 ${task.status === 'done' ? 'bg-green-500' : task.status === 'blocked' ? 'bg-red-500' : 'bg-blue-600'}`} 
                          />
                          <div className="flex items-center justify-between text-[9px] font-medium">
                            <span className="text-slate-400">
                              {task.status === 'done' ? 'Done' : new Date(task.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              task.status === 'done' ? 'bg-green-500' : 
                              task.status === 'blocked' || isBlocked ? 'bg-red-500' : 
                              task.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'
                            }`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
