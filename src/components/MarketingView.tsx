import React, { useState } from 'react';
import { Plus, Search, Video, Camera, Calendar, Clock, CheckCircle2, AlertCircle, MoreHorizontal, User, Share2, ShieldCheck, HardDrive, Zap, Info, MapPin, Target, Layout, PhoneCall, ShieldAlert, FileText } from 'lucide-react';
import { MarketingProject, MarketingProjectStatus, ContentType } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MarketingViewProps {
  projects: MarketingProject[];
  onUpdateProject: (id: string, updates: Partial<MarketingProject>) => void;
  onAddProject: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  projects,
  onUpdateProject,
  onAddProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectBrief, setSelectedProjectBrief] = useState<MarketingProject | null>(null);

  const getStatusBadge = (status: MarketingProjectStatus) => {
    switch (status) {
      case 'planning': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Planning</Badge>;
      case 'not_started': return <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">Not Started</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">In Progress</Badge>;
      case 'review': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Review</Badge>;
      case 'completed': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Completed</Badge>;
    }
  };

  const getProgress = (status: MarketingProjectStatus) => {
    switch (status) {
      case 'planning': return 10;
      case 'not_started': return 25;
      case 'in_progress': return 60;
      case 'review': return 90;
      case 'completed': return 100;
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Marketing Content Tracker</h2>
          <p className="text-xs text-slate-500">Monitor fabrication project videos, photos, and social media output.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 w-64 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" className="gap-2" onClick={onAddProject}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Shoots</CardDescription>
            <CardTitle className="text-2xl font-bold">{projects.filter(p => p.status === 'in_progress').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-blue-600 font-medium">Currently in production</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-purple-600">In Review</CardDescription>
            <CardTitle className="text-2xl font-bold">{projects.filter(p => p.status === 'review').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-purple-600 font-medium">Waiting for technical approval</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-green-600">Completed (MTD)</CardDescription>
            <CardTitle className="text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-green-600 font-medium">Delivered this month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:border-blue-200 transition-all overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {project.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <Camera className="w-4 h-4 text-purple-500" />}
                        <h4 className="text-base font-bold">{project.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {project.primaryGoal?.replace('_', ' ') || project.primaryGoal || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Layout className="w-3 h-3" />
                          {project.requiredFormat}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-xs font-medium">{project.assignedTo}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shoot Date</div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(project.shootDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deadline</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(project.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Channels</div>
                      <div className="flex flex-wrap gap-1">
                        {project.channels.map((ch, i) => (
                          <Badge key={i} variant="secondary" className="text-[9px] font-normal px-1.5 py-0 h-4">{ch}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Production Progress</span>
                      <span>{getProgress(project.status)}%</span>
                    </div>
                    <Progress value={getProgress(project.status)} className="h-1.5" />
                  </div>
                </div>

                <div className="w-full md:w-72 bg-slate-50/80 border-l border-slate-100 p-6 space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality & Safety Checks</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <ShieldCheck className={`w-4 h-4 ${project.safetyCheck ? 'text-green-500' : 'text-slate-300'}`} />
                        <span className={project.safetyCheck ? 'text-slate-700' : 'text-slate-400'}>PPE Compliance</span>
                      </div>
                      {project.safetyCheck ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => onUpdateProject(project.id, { safetyCheck: true })}>Verify</Button>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Zap className={`w-4 h-4 ${project.equipmentCheck ? 'text-amber-500' : 'text-slate-300'}`} />
                        <span className={project.equipmentCheck ? 'text-slate-700' : 'text-slate-400'}>Equipment Health</span>
                      </div>
                      {project.equipmentCheck ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => onUpdateProject(project.id, { equipmentCheck: true })}>Check</Button>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <HardDrive className={`w-4 h-4 ${project.rawFootageSaved ? 'text-blue-500' : 'text-slate-300'}`} />
                        <span className={project.rawFootageSaved ? 'text-slate-700' : 'text-slate-400'}>Raw Footage Saved</span>
                      </div>
                      {project.rawFootageSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => onUpdateProject(project.id, { rawFootageSaved: true })}>Save</Button>}
                    </div>
                  </div>

                  <Separator className="my-2" />
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase" onClick={() => {
                      const stages: MarketingProjectStatus[] = ['planning', 'not_started', 'in_progress', 'review', 'completed'];
                      const currentIndex = stages.indexOf(project.status);
                      if (currentIndex < stages.length - 1) {
                        onUpdateProject(project.id, { status: stages[currentIndex + 1] });
                      }
                    }}>
                      Next Stage
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={(props) => (
                          <Button {...props} variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        )}
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUpdateProject(project.id, { status: 'review' })}>Submit for Review</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateProject(project.id, { status: 'completed' })}>Mark Completed</DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem className="text-blue-600" onClick={() => setSelectedProjectBrief(project)}>View Brief</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel Project</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 text-white border-none">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h5 className="font-bold text-sm">Pro-Tip for Fabrication Content</h5>
            <p className="text-xs text-slate-400 mt-1">Always focus on "Action Shots": Sparks, heavy lifting, and final finishing. Ensure no safety violations are shown before posting to LinkedIn or YouTube.</p>
          </div>
        </CardContent>
      </Card>

      {/* Project Brief Modal */}
      {selectedProjectBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Project Brief</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProjectBrief(null)}>
                  <Plus className="w-4 h-4 rotate-45" />
                </Button>
              </div>
              <CardDescription>{selectedProjectBrief.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedProjectBrief.location}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Site Contact</div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    {selectedProjectBrief.onSiteContact}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Highlights</div>
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedProjectBrief.highlights}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal</div>
                  <Badge variant="secondary" className="text-[10px] capitalize">{selectedProjectBrief.primaryGoal}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</div>
                  <Badge variant="secondary" className="text-[10px] capitalize">{selectedProjectBrief.requiredFormat}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety</div>
                  <Badge className={`text-[10px] capitalize border-none ${selectedProjectBrief.safetyLevel === 'high_risk' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {selectedProjectBrief.safetyLevel?.replace('_', ' ') || selectedProjectBrief.safetyLevel || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setSelectedProjectBrief(null)}>Close Brief</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
