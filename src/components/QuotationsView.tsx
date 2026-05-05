/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Send, CheckCircle2, RotateCcw, Eye, FileDown } from 'lucide-react';
import { Quotation } from '../types';
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

interface QuotationsViewProps {
  quotations: Quotation[];
  onSend: (id: string) => void;
  onApprove: (id: string) => void;
  onRevise: (id: string) => void;
  onCreateProject: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onNew: () => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({ 
  quotations = [], 
  onSend, 
  onApprove, 
  onRevise, 
  onCreateProject,
  onDownloadPDF,
  onNew 
}) => {
  const safeQuotes = quotations || [];
  const calcTotal = (q: Quotation) => Math.round((q.material + q.labour) / (1 - q.margin / 100));

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Sent</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'revised': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Revised</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Quotes</div>
            <div className="text-2xl font-bold">{safeQuotes.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pipeline Value</div>
            <div className="text-2xl font-bold">₹{(safeQuotes.filter(q => q.status === 'sent').reduce((s, q) => s + calcTotal(q), 0) / 100000).toFixed(2)}L</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Approved</div>
            <div className="text-2xl font-bold text-green-600">{safeQuotes.filter(q => q.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Follow-up Due</div>
            <div className="text-2xl font-bold text-red-600">{safeQuotes.filter(q => q.status === 'sent' && q.followupDue && new Date(q.followupDue) < new Date()).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Quotations</CardTitle>
            <CardDescription>Manage estimates and client approvals</CardDescription>
          </div>
          <Button onClick={onNew} className="gap-2">
            <Plus className="w-4 h-4" />
            New Quote
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Ver.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeQuotes.map((q) => {
                const total = calcTotal(q);
                const isOverdue = q.status === 'sent' && q.followupDue && new Date(q.followupDue) < new Date();
                return (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs text-slate-500">{q.id}</TableCell>
                    <TableCell className="font-medium">{q.client}</TableCell>
                    <TableCell className="text-xs text-slate-500">{q.type}</TableCell>
                    <TableCell className="text-xs">V{q.version}</TableCell>
                    <TableCell className="font-bold">₹{total.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(q.status)}
                        {isOverdue && <Badge variant="destructive" className="text-[10px] h-5">Follow-up!</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {q.status === 'draft' && (
                          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => onSend(q.id)}>
                            <Send className="w-3 h-3" /> Send
                          </Button>
                        )}
                        {q.status === 'sent' && (
                          <>
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-green-600 hover:text-green-700" onClick={() => onApprove(q.id)}>
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => onRevise(q.id)}>
                              <RotateCcw className="w-3 h-3" /> Revise
                            </Button>
                          </>
                        )}
                        {q.status === 'approved' && (
                          <Button size="sm" className="h-8 gap-1" onClick={() => onCreateProject(q.id)}>
                            Create Project
                          </Button>
                        )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownloadPDF(q.id)}>
                            <FileDown className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
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
