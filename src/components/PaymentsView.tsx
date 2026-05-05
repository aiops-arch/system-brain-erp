/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Bell } from 'lucide-react';
import { Project, Payment } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface PaymentsViewProps {
  projects: Project[];
  payments: Payment[];
  onMarkReceived: (id: string) => void;
  onSendReminder: (id: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ 
  projects, 
  payments, 
  onMarkReceived, 
  onSendReminder 
}) => {
  const received = payments.filter(p => p.status === 'received').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter(p => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Received</div>
            <div className="text-2xl font-bold text-green-600">₹{(received / 100000).toFixed(2)}L</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pending</div>
            <div className="text-2xl font-bold text-amber-600">₹{(pending / 100000).toFixed(2)}L</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600">₹{(overdue / 100000).toFixed(2)}L</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Outstanding</div>
            <div className="text-2xl font-bold">₹{((pending + overdue) / 100000).toFixed(2)}L</div>
          </CardContent>
        </Card>
      </div>

      {payments.filter(p => p.status === 'overdue').map(p => {
        const proj = projects.find(x => x.id === p.projectId);
        return (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border bg-red-50 border-red-100 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>✕ {proj?.client || p.projectId} — {p.type} payment overdue {Math.round((new Date().getTime() - new Date(p.due).getTime()) / (1000 * 60 * 60 * 24))}d · ₹{p.amount.toLocaleString('en-IN')} · Rule 7: work BLOCKED</span>
          </div>
        );
      })}

      <div className="space-y-4">
        {projects.map(proj => {
          const projPayments = payments.filter(p => p.projectId === proj.id);
          if (projPayments.length === 0) return null;
          
          const totalRec = projPayments.filter(p => p.status === 'received').reduce((s, p) => s + p.amount, 0);
          const totalPend = projPayments.filter(p => p.status !== 'received').reduce((s, p) => s + p.amount, 0);
          const pct = Math.round(totalRec / (totalRec + totalPend || 1) * 100);

          return (
            <Card key={proj.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-bold">{proj.id} · {proj.client}</CardTitle>
                  <CardDescription className="text-xs">₹{proj.value.toLocaleString('en-IN')} total contract value</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{pct}% collected</div>
                    <Progress value={pct} className="h-1 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stage</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projPayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="capitalize">{p.type}</TableCell>
                        <TableCell className={`font-bold ${p.status === 'overdue' ? 'text-red-600' : ''}`}>₹{p.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={new Date(p.due) < new Date() && p.status !== 'received' ? 'text-red-600' : ''}>
                          {new Date(p.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'received' ? 'default' : p.status === 'overdue' ? 'destructive' : 'secondary'}>
                            {p.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {p.status !== 'received' && (
                              <>
                                <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => onMarkReceived(p.id)}>
                                  Mark Received
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onSendReminder(p.id)}>
                                  <Bell className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
