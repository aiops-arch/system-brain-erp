/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarChart3, TrendingUp, Package, Users, IndianRupee, Factory, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Project, Payment, InventoryItem, PurchaseOrder, Lead } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ReportsViewProps {
  projects: Project[];
  payments: Payment[];
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  leads: Lead[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects = [],
  payments = [],
  inventory = [],
  purchaseOrders = [],
  leads = []
}) => {
  const totalRevenue = (payments || []).filter(p => p.status === 'received').reduce((acc, p) => acc + p.amount, 0);
  const pendingRevenue = (payments || []).filter(p => p.status !== 'received').reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = (purchaseOrders || []).filter(po => po.status === 'received').reduce((acc, po) => acc + po.totalAmount, 0);
  
  const conversionRate = (leads || []).length > 0 
    ? Math.round((leads.filter(l => l.stage === 'approved').length / leads.length) * 100) 
    : 0;

  const lowStockItems = (inventory || []).filter(i => i.qty <= i.threshold);
  const activeProjectsCount = (projects || []).filter(p => p.status === 'active').length;
  const avgProgress = (projects || []).length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground text-sm">Comprehensive business performance overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(2)}L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
              <TrendingUp className="w-3 h-3" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-600 text-[10px] font-bold uppercase tracking-wider">Net Profit (Est.)</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{((totalRevenue - totalExpenses) / 100000).toFixed(2)}L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
              <TrendingUp className="w-3 h-3" />
              Margin: {totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-600 text-[10px] font-bold uppercase tracking-wider">Pending Collection</CardDescription>
            <CardTitle className="text-2xl font-bold">₹{(pendingRevenue / 100000).toFixed(2)}L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-amber-600 font-medium">
              {payments.filter(p => p.status !== 'received').length} pending payments
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">Conversion Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">{conversionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[10px] text-purple-600 font-medium">
              Leads to Won Projects
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Production Efficiency</CardTitle>
            <CardDescription>Average progress across all active projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall Production Load</span>
                <span>{avgProgress}%</span>
              </div>
              <Progress value={avgProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Projects</div>
                <div className="text-xl font-bold">{activeProjectsCount}</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delayed</div>
                <div className="text-xl font-bold text-red-600">
                  {projects.filter(p => p.status === 'active' && new Date(p.deadline) < new Date()).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Health</CardTitle>
            <CardDescription>Critical stock levels and reorder alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 4).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-red-50 border border-red-100">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-900">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-red-600">{item.qty} {item.unit} left</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">All stock levels are healthy</p>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total Inventory Value</span>
                  <span className="font-bold">₹{inventory.reduce((acc, i) => acc + (i.qty * i.rate), 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Projects by Value</CardTitle>
          <CardDescription>Highest value fabrication contracts currently active.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.sort((a, b) => b.value - a.value).slice(0, 5).map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.client}</TableCell>
                  <TableCell>₹{p.value.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="h-1.5 w-16" />
                      <span className="text-[10px]">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
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
