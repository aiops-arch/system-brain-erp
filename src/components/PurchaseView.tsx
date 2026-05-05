/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, ShoppingCart, Truck, Package, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { Supplier, PurchaseOrder, InventoryItem } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface PurchaseViewProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  inventory: InventoryItem[];
  onReceivePO: (id: string) => void;
  onCreatePO: (data: Partial<PurchaseOrder>) => void;
  onCreateSupplier: (data: Partial<Supplier>) => void;
}

export const PurchaseView: React.FC<PurchaseViewProps> = ({
  suppliers,
  purchaseOrders,
  inventory,
  onReceivePO,
  onCreatePO,
  onCreateSupplier
}) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [search, setSearch] = useState('');

  const filteredOrders = purchaseOrders.filter(po => 
    po.id.toLowerCase().includes(search.toLowerCase()) ||
    suppliers.find(s => s.id === po.supplierId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.gstin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Purchase Management</h2>
          <p className="text-muted-foreground text-sm">Manage suppliers, purchase orders, and material intake.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onCreateSupplier({})} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Supplier
          </Button>
          <Button onClick={() => onCreatePO({})} className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            New PO
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="w-4 h-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Truck className="w-4 h-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder={activeTab === 'orders' ? "Search PO ID or Supplier..." : "Search Supplier name or GST..."}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <CardDescription>Track material procurement and intake.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((po) => {
                    const supplier = suppliers.find(s => s.id === po.supplierId);
                    return (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono text-xs">{po.id}</TableCell>
                        <TableCell className="font-medium">{supplier?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {po.items.map(i => `${i.qty} x ${i.name}`).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>₹{po.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant={
                            po.status === 'received' ? 'default' : 
                            po.status === 'sent' ? 'secondary' : 'outline'
                          }>
                            {po.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(po.expectedDelivery).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {po.status === 'sent' && (
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-green-600 border-green-200 hover:bg-green-50" onClick={() => onReceivePO(po.id)}>
                              <CheckCircle2 className="w-3 h-3" />
                              Receive
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{supplier.name}</CardTitle>
                      <CardDescription className="text-xs">{supplier.contactPerson}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{supplier.id}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs space-y-1">
                    <p className="text-slate-500">GSTIN: <span className="text-slate-900 font-mono">{supplier.gstin}</span></p>
                    <p className="text-slate-500">Phone: <span className="text-slate-900">{supplier.phone}</span></p>
                    <p className="text-slate-500">Email: <span className="text-slate-900">{supplier.email}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {supplier.category.map(cat => (
                      <Badge key={cat} variant="secondary" className="text-[9px] uppercase tracking-wider">{cat?.replace('_', ' ') || cat}</Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs h-8">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
