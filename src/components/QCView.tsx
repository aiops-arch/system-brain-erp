/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { QCCheck, Project } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface QCViewProps {
  qcChecks: QCCheck[];
  projects: Project[];
  onToggleItem: (qcId: string, idx: number) => void;
  onSetResult: (qcId: string, result: QCCheck['result']) => void;
  onNew: () => void;
  onGoToDispatch: () => void;
}

export const QCView: React.FC<QCViewProps> = ({ 
  qcChecks, 
  projects, 
  onToggleItem, 
  onSetResult, 
  onNew,
  onGoToDispatch 
}) => {
  const passed = qcChecks.filter(q => q.result === 'pass').length;
  const rework = qcChecks.filter(q => q.result === 'rework').length;
  const pending = qcChecks.filter(q => q.result === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pending QC</div>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Passed</div>
            <div className="text-2xl font-bold text-green-600">{passed}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rework</div>
            <div className="text-2xl font-bold text-amber-600">{rework}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pass Rate</div>
            <div className="text-2xl font-bold">{qcChecks.length ? Math.round(passed / qcChecks.length * 100) : 0}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Quality Control Checks</h3>
        <Button onClick={onNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New QC Check
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {qcChecks.map((qc) => {
          const project = projects.find(p => p.id === qc.projectId);
          const passedItems = qc.items.filter(i => i.passed === true).length;
          const failedItems = qc.items.filter(i => i.passed === false).length;
          const totalDone = qc.items.filter(i => i.passed !== null).length;
          
          const borderColor = qc.result === 'pass' ? 'border-green-200' : qc.result === 'rework' ? 'border-amber-200' : qc.result === 'fail' ? 'border-red-200' : 'border-slate-200';
          const bgColor = qc.result === 'pass' ? 'bg-green-50/30' : qc.result === 'rework' ? 'bg-amber-50/30' : qc.result === 'fail' ? 'bg-red-50/30' : 'bg-white';

          return (
            <Card key={qc.id} className={`${borderColor} ${bgColor} overflow-hidden`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold">{qc.projectId} · {project?.client}</CardTitle>
                    <CardDescription className="text-[10px] font-medium uppercase tracking-wider">
                      QC by: {qc.checkedBy} · {totalDone}/{qc.items.length} checked
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold">{passedItems}/{qc.items.length}</span>
                    <Badge variant={qc.result === 'pass' ? 'default' : 'secondary'}>
                      {qc.result.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  {qc.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onToggleItem(qc.id, idx)}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-100/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        item.passed === true ? 'bg-green-100 border-green-200 text-green-700' : 
                        item.passed === false ? 'bg-red-100 border-red-200 text-red-700' : 
                        'bg-slate-50 border-slate-200 text-slate-300'
                      }`}>
                        {item.passed === true ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.passed === false ? <XCircle className="w-3.5 h-3.5" /> : null}
                      </div>
                      <span className={`text-xs flex-1 ${item.passed === false ? 'text-red-700 font-medium' : item.passed === null ? 'text-slate-400' : 'text-slate-700'}`}>
                        {item.label}
                      </span>
                      {item.note && <span className="text-[10px] text-red-500 font-medium italic">{item.note}</span>}
                    </div>
                  ))}
                </div>

                <Separator className="bg-slate-200/50" />

                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {failedItems > 0 ? `${failedItems} items failed` : 'All checks complete'}
                  </div>
                  <div className="flex gap-2">
                    {qc.result !== 'pass' && (
                      <>
                        <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => onSetResult(qc.id, 'fail')}>Fail</Button>
                        <Button variant="outline" size="sm" className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => onSetResult(qc.id, 'rework')}>Rework</Button>
                        <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => onSetResult(qc.id, 'pass')}>Pass</Button>
                      </>
                    )}
                    {qc.result === 'pass' && (
                      <Button size="sm" className="h-8 gap-1" onClick={onGoToDispatch}>
                        Dispatch <ArrowRight className="w-3 h-3" />
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
