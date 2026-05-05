/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, AlertTriangle, Package, ArrowDownToLine, ArrowUpFromLine, History, Trash2, Search } from 'lucide-react';
import { InventoryItem, MaterialRequest } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface InventoryViewProps {
  inventory: InventoryItem[];
  materialRequests: MaterialRequest[];
  onIssue: (id: string) => void;
  onRestock: (id: string) => void;
  onAdd: () => void;
  onNewMR: () => void;
  onIssueMR: (id: string) => void;
  onRaisePO: (id: string) => void;
  onWastage: (id: string, qty: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  inventory = [], 
  materialRequests = [], 
  onIssue, 
  onRestock, 
  onAdd,
  onNewMR,
  onIssueMR,
  onRaisePO,
  onWastage
}) => {
  const safeInventory = inventory || [];
  const safeMRs = materialRequests || [];
  
  const lowStock = safeInventory.filter(i => i.qty <= i.threshold);
  const outOfStock = safeInventory.filter(i => i.qty === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory & Stock</h2>
          <p className="text-muted-foreground text-sm">Track raw materials, consumables, and wastage.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onNewMR} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            New MR
          </Button>
          <Button onClick={onAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Items</div>
            <div className="text-2xl font-bold">{safeInventory.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stock Value</div>
            <div className="text-2xl font-bold">₹{(safeInventory.reduce((s, i) => s + i.qty * i.rate, 0) / 100000).toFixed(2)}L</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Low Stock</div>
            <div className="text-2xl font-bold text-amber-600">{lowStock.filter(i => i.qty > 0).length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 border-none shadow-none">
          <CardContent className="p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Out of Stock</div>
            <div className="text-2xl font-bold text-red-600">{outOfStock.length}</div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <div className="space-y-2">
          {lowStock.map(i => (
            <div key={i.id} className={`flex items-center gap-3 p-3 rounded-lg border text-xs font-medium ${i.qty === 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{i.qty === 0 ? '✕' : '!'} {i.name} — {i.qty} {i.unit} (threshold: {i.threshold}) — Rule 15</span>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" className="gap-2">
            <Package className="w-4 h-4" />
            Stock Register
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <ArrowUpFromLine className="w-4 h-4" />
            Material Requests
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Stock History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Stock</CardTitle>
              <CardDescription>Real-time raw material and tool tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeInventory.map((item) => {
                    const pct = Math.min(100, Math.round(item.qty / Math.max(item.threshold * 2, 1) * 100));
                    const isLow = item.qty <= item.threshold;
                    const isOut = item.qty === 0;
                    
                    return (
                      <TableRow key={item.id} className={isOut ? 'bg-red-50/30' : isLow ? 'bg-amber-50/30' : ''}>
                        <TableCell className="font-mono text-xs text-slate-500">{item.id}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            {item.category?.replace('_', ' ') || item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : ''}`}>
                          {item.qty} {item.unit}
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <Progress value={pct} className={`h-1.5 ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'}`} />
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">₹{item.rate}/{item.unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onIssue(item.id)} title="Issue Stock">
                              <ArrowUpFromLine className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onRestock(item.id)} title="Restock">
                              <ArrowDownToLine className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" title="Report Wastage" onClick={() => onWastage(item.id, 1)}>
                              <Trash2 className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Material Requests</CardTitle>
              <CardDescription>Production floor requisitions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Requested by</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeMRs.map((mr) => {
                    const item = safeInventory.find(i => i.id === mr.itemId);
                    return (
                      <TableRow key={mr.id}>
                        <TableCell className="font-mono text-xs text-slate-500">{mr.id}</TableCell>
                        <TableCell className="font-medium">{item?.name || mr.itemId}</TableCell>
                        <TableCell className="text-xs font-bold">{mr.qty} {item?.unit}</TableCell>
                        <TableCell className="text-xs text-slate-500">{mr.projectId}</TableCell>
                        <TableCell className="text-xs text-slate-500">{mr.requestedBy}</TableCell>
                        <TableCell>
                          <Badge variant={mr.status === 'issued' ? 'default' : 'secondary'}>
                            {mr.status?.replace('_', ' ') || mr.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {mr.status === 'pending' && (
                              <>
                                <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => onIssueMR(mr.id)}>Issue</Button>
                                <Button variant="outline" size="sm" className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => onRaisePO(mr.id)}>Raise PO</Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <CardDescription>Audit log of all stock movements.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <History className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Stock movement history will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
