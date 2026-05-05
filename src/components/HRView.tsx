import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, User, Briefcase, GraduationCap, Clock, IndianRupee, CheckCircle2, AlertCircle, Calendar, MessageSquare, Phone, Mail } from 'lucide-react';
import { Vacancy, Candidate, VacancyStatus, VacancyPriority, CandidateStage, ExperienceLevel } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HRViewProps {
  vacancies: Vacancy[];
  candidates: Candidate[];
  onUpdateVacancy: (id: string, updates: Partial<Vacancy>) => void;
  onUpdateCandidate: (id: string, updates: Partial<Candidate>) => void;
  onAddVacancy: () => void;
  onAddCandidate: (vacancyId?: string) => void;
}

export const HRView: React.FC<HRViewProps> = ({
  vacancies,
  candidates,
  onUpdateVacancy,
  onUpdateCandidate,
  onAddVacancy,
  onAddCandidate
}) => {
  const [activeTab, setActiveTab] = useState('vacancies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);

  const getPriorityBadge = (priority: VacancyPriority) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-700 border-none">High Priority</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-700 border-none">Medium</Badge>;
      case 'low': return <Badge className="bg-slate-100 text-slate-700 border-none">Low</Badge>;
    }
  };

  const getStatusBadge = (status: VacancyStatus) => {
    switch (status) {
      case 'open': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Open</Badge>;
      case 'interviewing': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Interviewing</Badge>;
      case 'on_hold': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">On Hold</Badge>;
      case 'closed': return <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">Closed</Badge>;
    }
  };

  const getStageBadge = (stage: CandidateStage) => {
    const config: Record<CandidateStage, { label: string; color: string }> = {
      applied: { label: 'Applied', color: 'bg-slate-100 text-slate-700' },
      interviewed: { label: 'Interviewed', color: 'bg-blue-100 text-blue-700' },
      practical_test: { label: 'Practical Test', color: 'bg-purple-100 text-purple-700' },
      offered: { label: 'Offered', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
      hired: { label: 'Hired', color: 'bg-emerald-600 text-white' }
    };
    const { label, color } = config[stage];
    return <Badge className={`${color} border-none text-[10px]`}>{label}</Badge>;
  };

  const filteredVacancies = vacancies.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.jobCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.certifications.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white p-1 rounded-lg border border-slate-200">
            <TabsList className="bg-transparent border-none">
              <TabsTrigger value="vacancies" className="text-xs gap-2">
                <Briefcase className="w-3.5 h-3.5" />
                Vacancies
              </TabsTrigger>
              <TabsTrigger value="candidates" className="text-xs gap-2">
                <User className="w-3.5 h-3.5" />
                Candidates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-64 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="sm" className="gap-2" onClick={() => activeTab === 'vacancies' ? onAddVacancy() : onAddCandidate()}>
            <Plus className="w-4 h-4" />
            {activeTab === 'vacancies' ? 'New Vacancy' : 'New Candidate'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="vacancies" className="m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map(vacancy => {
              const vacancyCandidates = candidates.filter(c => c.vacancyId === vacancy.id);
              return (
                <Card key={vacancy.id} className="hover:border-blue-300 transition-all cursor-pointer group" onClick={() => setSelectedVacancy(vacancy)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{vacancy.jobCode}</div>
                        <CardTitle className="text-base">{vacancy.title}</CardTitle>
                      </div>
                      {getPriorityBadge(vacancy.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {vacancy.requiredCertifications.map((cert, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] font-normal px-1.5 py-0 h-4">{cert}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Candidates</div>
                          <div className="text-sm font-bold">{vacancyCandidates.length}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                          <div className="mt-0.5">{getStatusBadge(vacancy.status)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Posted</div>
                        <div className="text-xs text-slate-600">{new Date(vacancy.created).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="m-0 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map(candidate => {
              const vacancy = vacancies.find(v => v.id === candidate.vacancyId);
              return (
                <Card key={candidate.id} className="hover:border-blue-200 transition-all">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold">{candidate.name}</h4>
                            {getStageBadge(candidate.currentStage)}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {vacancy?.title || 'Unknown Position'}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {candidate.experienceLevel.charAt(0).toUpperCase() + candidate.experienceLevel.slice(1)} Level
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Applied {new Date(candidate.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Skill Test</div>
                          <div className={`text-xs font-medium flex items-center gap-1 ${candidate.skillTestResult.includes('Passed') ? 'text-green-600' : 'text-slate-600'}`}>
                            {candidate.skillTestResult.includes('Passed') ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {candidate.skillTestResult}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Expected Salary</div>
                          <div className="text-xs font-bold flex items-center">
                            <IndianRupee className="w-3 h-3" />
                            {candidate.expectedSalary.toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Notice Period</div>
                          <div className="text-xs font-medium text-slate-600">{candidate.noticePeriod}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                            <Phone className="w-4 h-4" />
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
                              <DropdownMenuItem onClick={() => onUpdateCandidate(candidate.id, { currentStage: 'interviewed' })}>Move to Interview</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateCandidate(candidate.id, { currentStage: 'practical_test' })}>Move to Practical Test</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateCandidate(candidate.id, { currentStage: 'offered' })}>Make Offer</DropdownMenuItem>
                              <Separator className="my-1" />
                              <DropdownMenuItem className="text-red-600">Reject Candidate</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Certs:</span>
                      {candidate.certifications.split(',').map((cert, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] font-normal py-0 px-1.5 h-4 whitespace-nowrap">{cert.trim()}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
