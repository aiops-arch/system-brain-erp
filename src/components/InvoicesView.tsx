/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FileText, IndianRupee, Download, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Invoice } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface InvoicesViewProps {
  invoices: Invoice[];
  onSendInvoice: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDownload: (id: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices = [],
  onSendInvoice,
  onMarkPaid,
  onDownload
}) => {
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Paid</Badge>;
      case 'sent': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Sent</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  const safeInvoices = invoices || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tax Invoices</h2>
          <p className="text-muted-foreground text-sm">GST compliant invoicing and billing management.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Manual Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Invoiced</p>
                <p className="text-xl font-bold">₹{safeInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
                <p className="text-xl font-bold">₹{safeInvoices.filter(i => i.status !== 'paid').reduce((acc, inv) => acc + inv.totalAmount, 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected</p>
                <p className="text-xl font-bold">₹{safeInvoices.filter(i => i.status === 'paid').reduce((acc, inv) => acc + inv.totalAmount, 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>GST (18%)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs">{invoice.id}</TableCell>
                  <TableCell className="font-medium">{invoice.client}</TableCell>
                  <TableCell>₹{invoice.subTotal.toLocaleString('en-IN')}</TableCell>
                  <TableCell>₹{invoice.gstTotal.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="font-bold">₹{invoice.totalAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(invoice.id)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onSendInvoice(invoice.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => onMarkPaid(invoice.id)}>
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

import { Plus } from 'lucide-react';
