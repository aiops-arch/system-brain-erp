/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Shield, Lock, UserPlus, Mail, Building2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UsersViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: () => void;
  onChangeRole: (userId: string, role: UserRole) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onChangeRole
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Admin</Badge>;
      case 'manager': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Manager</Badge>;
      case 'operator': return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Operator</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Roles & Permissions</h2>
          <p className="text-muted-foreground text-sm">Manage team access and department permissions.</p>
        </div>
        <Button onClick={onAddUser} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>Active users in the ERP system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Building2 className="w-3 h-3" />
                        {user.department}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right">
                      {currentUser.role === 'admin' && user.id !== currentUser.id && (
                        <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Role Definitions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Admin</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Full system access. Manage finances, users, and global settings.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Manager</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Manage projects, production, and inventory. No access to user management.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operator</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">View assigned tasks, update production progress, and request materials.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                Security Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Last Login</p>
                <p className="text-xs">Mayur · 2 mins ago</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 space-y-1">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Sessions</p>
                <p className="text-xs">3 devices connected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
