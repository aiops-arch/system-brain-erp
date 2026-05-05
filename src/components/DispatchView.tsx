/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Truck, CheckCircle2, AlertTriangle, MapPin, User, Package } from 'lucide-react';
import { Project, Dispatch, QCCheck, Payment } from '../types';
import { canDispatch } from '../lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface DispatchViewProps {
  projects: Project[];
  dispatches: Dispatch[];
  qcChecks: QCCheck[];
  payments: Payment[];
  onDispatch: (projectId: string) => void;
  onDeliver: (dispatchId: string) => void;
  onGoToQC: () => void;
  onGoToPayments: () => void;
  state: any; // for canDispatch
}

export const DispatchView: React.FC<DispatchViewProps> = ({ 
  projects, 
  dispatches, 
  qcChecks, 
  payments, 
  onDispatch, 
  onDeliver,
  onGoToQC,
  onGoToPayments,
  state
}) => {
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ready to Dispatch</div>
            <div className="text-2xl font-bold text-green-600">{activeProjects.filter(p => canDispatch(p.id, state).ok).length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dispatch Blocked</div>
            <div className="text-2xl font-bold text-red-600">{activeProjects.filter(p => !canDispatch(p.id, state).ok).length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Dispatched</div>
            <div className="text-2xl font-bold">{dispatches.filter(d => d.status === 'dispatched').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Delivered</div>
            <div className="text-2xl font-bold text-green-600">{dispatches.filter(d => d.status === 'delivered').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Dispatch Control</h3>
        {activeProjects.map((project) => {
          const gate = canDispatch(project.id, state);
          const dsp = dispatches.find(d => d.projectId === project.id);
          const qcPassed = qcChecks.find(q => q.projectId === project.id && q.result === 'pass');
          const projectPayments = payments.filter(p => p.projectId === project.id);
          const allPaid = projectPayments.every(p => p.status === 'received');
          const pendingAmount = projectPayments.filter(p => p.status !== 'received').reduce((s, p) => s + p.amount, 0);

          return (
            <Card key={project.id} className={gate.ok ? 'border-green-200' : 'border-red-200'}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{project.id} · {project.client}</span>
                      {gate.ok ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Ready to Dispatch</Badge>
                      ) : (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                      {dsp && <Badge variant="outline">{dsp.status.toUpperCase()}</Badge>}
                    </div>
                    <div className="text-xs text-slate-500">{project.type} · ₹{project.value.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${qcPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {qcPassed ? '✓' : '✕'} QC {qcPassed ? 'Passed' : 'Pending'}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${allPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {allPaid ? '✓' : '✕'} Payment {allPaid ? 'Cleared' : `₹${(pendingAmount / 1000).toFixed(0)}k pending`}
                  </div>
                  {!gate.ok && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700">
                      ✕ {gate.reason}
                    </div>
                  )}
                </div>

                {dsp && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vehicle</div>
                      <div className="text-xs font-medium flex items-center gap-2"><Truck className="w-3 h-3" /> {dsp.vehicle || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address</div>
                      <div className="text-xs font-medium flex items-center gap-2"><MapPin className="w-3 h-3" /> {dsp.address || '—'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
                      <div className="text-xs font-medium">{dsp.status.toUpperCase()}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!qcPassed && <Button variant="outline" size="sm" onClick={onGoToQC}>Go to QC</Button>}
                  {!allPaid && <Button variant="outline" size="sm" onClick={onGoToPayments}>Go to Payments</Button>}
                  {gate.ok && !dsp && <Button size="sm" onClick={() => onDispatch(project.id)}>Dispatch Now</Button>}
                  {dsp && dsp.status === 'dispatched' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onDeliver(dsp.id)}>Mark Delivered</Button>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispatch History</CardTitle>
          <CardDescription>Recently fulfilled orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dispatches.filter(d => d.status === 'dispatched' || d.status === 'delivered').map((d) => {
                const proj = projects.find(p => p.id === d.projectId);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.projectId}</TableCell>
                    <TableCell className="font-medium">{proj?.client || '—'}</TableCell>
                    <TableCell className="text-xs">{d.vehicle || '—'}</TableCell>
                    <TableCell className="text-xs text-slate-500">{d.dispatched ? new Date(d.dispatched).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'delivered' ? 'default' : 'secondary'}>{d.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
