/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  Briefcase, 
  Factory, 
  Package, 
  ShieldCheck, 
  Truck,
  Bell,
  Search,
  User,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Zap,
  ListTodo,
  Sparkles,
  MousePointer2,
  ShoppingCart,
  BarChart3,
  Shield,
  Download,
  Send,
  Share2,
  IndianRupee,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

import { loadState, saveState, checkGates, canDispatch, autoCreateTasks, autoCreateProject, processMaterialIssue, receivePO, generateInvoiceFromProject, reportWastage, createDesignerProject, advanceDesignerWorkflow } from './lib/store';
import { Lead, Project, Payment, InventoryItem, Task, Quotation, MaterialRequest, QCCheck, Dispatch, TaskType, QCResult, Supplier, PurchaseOrder, Invoice, UserProfile, UserRole, WASequence, LeadSequenceStatus, Vacancy, Candidate, MarketingProject, DesignerGrade, DesignerProjectPriority } from './types';

// --- Views ---
import { CRMView } from './components/CRMView';
import { HRView } from './components/HRView';
import { MarketingView } from './components/MarketingView';
import { QuotationsView } from './components/QuotationsView';
import { PaymentsView } from './components/PaymentsView';
import { ProjectsView } from './components/ProjectsView';
import { ProductionView } from './components/ProductionView';
import { InventoryView } from './components/InventoryView';
import { QCView } from './components/QCView';
import { DispatchView } from './components/DispatchView';
import { PurchaseView } from './components/PurchaseView';
import { ReportsView } from './components/ReportsView';
import { UsersView } from './components/UsersView';
import { InvoicesView } from './components/InvoicesView';
import { DesignerWorkflowView } from './components/DesignerWorkflowView';

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

// --- Forms ---
import { QuotationForm } from './components/modals/QuotationForm';
import { InventoryForm } from './components/modals/InventoryForm';
import { PurchaseOrderForm } from './components/modals/PurchaseOrderForm';
import { LeadForm } from './components/modals/LeadForm';
import { MarketingRequestForm } from './components/modals/MarketingRequestForm';

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMRId, setSelectedMRId] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const result = advanceDesignerWorkflow(prev);
        return result.changed ? result.state : prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // --- Automation: Overdue Follow-up Reminders ---
  useEffect(() => {
    if (!state.globalAutoReminder) return;

    const interval = setInterval(() => {
      const now = new Date();
      let hasChanges = false;
      const updatedLeads = state.leads.map(lead => {
        const followupDate = new Date(lead.followup);
        // If overdue and autoReminder is enabled for this lead
        if (lead.autoReminder && followupDate < now && lead.stage !== 'approved' && lead.stage !== 'lost') {
          // Check if we already sent a reminder today to avoid spamming
          const lastReminder = lead.activityLogs
            .filter(log => log.type === 'system' && (log.content.includes('Auto WhatsApp reminder sent') || log.content.includes('Auto WhatsApp reminder sent')))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          const intervalMs = state.reminderConfig.intervalDays * 24 * 60 * 60 * 1000;
          
          if (!lastReminder || (now.getTime() - new Date(lastReminder.timestamp).getTime()) >= intervalMs) {
            hasChanges = true;
            const logId = `AL-AUTO-${Math.random().toString(36).substr(2, 9)}`;
            const activeTemplate = state.reminderTemplates.find(t => t.id === state.reminderConfig.templateId);
            const templateContent = activeTemplate ? activeTemplate.content : 'Follow-up reminder';
            
            const newLog = {
              id: logId,
              type: 'system' as const,
              content: `Auto WhatsApp reminder sent: "${templateContent}" (Scheduled: ${new Date(lead.followup).toLocaleDateString()})`,
              timestamp: now.toISOString(),
              performedBy: 'System Automation'
            };
            
            toast.info(`Auto-reminder sent to ${lead.client}`, {
              description: `Template: ${activeTemplate?.name || 'Standard'}`
            });

            return {
              ...lead,
              activityLogs: [newLog, ...lead.activityLogs],
              lastActivity: now.toISOString()
            };
          }
        }
        return lead;
      });

      if (hasChanges) {
        setState(prev => ({ ...prev, leads: updatedLeads }));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [state.globalAutoReminder, state.leads, state.reminderConfig, state.reminderTemplates]);

  // --- Automation: WhatsApp Sequences ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hasChanges = false;
      
      const updatedStatuses = state.leadSequenceStatuses.map(status => {
        if (status.status !== 'active') return status;
        
        const sequence = state.sequences.find(s => s.id === status.sequenceId);
        if (!sequence || !sequence.isActive) return status;
        
        const nextStepIndex = status.currentStepIndex + 1;
        if (nextStepIndex >= sequence.steps.length) {
          return { ...status, status: 'completed' as const };
        }
        
        const nextStep = sequence.steps[nextStepIndex];
        const lastSent = new Date(status.lastStepSentAt);
        const daysSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLast >= nextStep.delayDays) {
          hasChanges = true;
          const lead = state.leads.find(l => l.id === status.leadId);
          let newLog = null;
          if (lead) {
            // Log the activity to the lead's activityLogs
            const logId = `AL-SEQ-${Math.random().toString(36).substr(2, 9)}`;
            newLog = {
              id: logId,
              type: 'whatsapp' as const,
              content: `Sequence Step Sent: ${nextStep.templateName} - "${nextStep.content}"`,
              timestamp: now.toISOString(),
              performedBy: 'System Automation'
            };
            
            toast.info(`Sequence step sent to ${lead.client}`, {
              description: `Step: ${nextStep.templateName}`
            });
          }
          
          return {
            ...status,
            currentStepIndex: nextStepIndex,
            lastStepSentAt: now.toISOString(),
            status: nextStepIndex === sequence.steps.length - 1 ? 'completed' as const : 'active' as const,
            _leadLog: newLog // Store log to be added to lead
          };
        }
        
        return status;
      });

      if (hasChanges) {
        setState(prev => {
          // Apply lead logs from sequence updates
          const updatedLeads = prev.leads.map(lead => {
            const statusWithLog = updatedStatuses.find(s => s.leadId === lead.id && s._leadLog);
            if (statusWithLog && statusWithLog._leadLog) {
              const log = statusWithLog._leadLog;
              return {
                ...lead,
                activityLogs: [log, ...(lead.activityLogs || [])],
                lastActivity: now.toISOString()
              };
            }
            return lead;
          });
          // Clean up the temporary _leadLog property
          const cleanStatuses = updatedStatuses.map(({ _leadLog, ...rest }) => rest);
          return { ...prev, leadSequenceStatuses: cleanStatuses, leads: updatedLeads };
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.sequences, state.leadSequenceStatuses, state.leads]);

  // --- Handlers ---
  const addQuotation = (data: Partial<Quotation>) => {
    const id = `Q-${state.nextIds.quote}`;
    const newQuote: Quotation = {
      id,
      leadId: data.leadId || '',
      client: data.client || 'Unknown',
      type: data.type || 'General',
      version: 1,
      material: data.material || 0,
      labour: data.labour || 0,
      margin: data.margin || 20,
      status: 'draft',
      created: new Date().toISOString(),
      sentAt: null,
      followupDue: null,
    };
    setState(prev => ({
      ...prev,
      quotations: [newQuote, ...prev.quotations],
      nextIds: { ...prev.nextIds, quote: prev.nextIds.quote + 1 }
    }));
    setModalType(null);
    toast.success(`Quotation ${id} created`);
  };

  const reviseQuote = (id: string) => {
    const q = state.quotations.find(x => x.id === id);
    if (!q) return;
    const newId = `${id}-R1`;
    const revised: Quotation = {
      ...q,
      id: newId,
      version: q.version + 1,
      status: 'draft',
      created: new Date().toISOString(),
      sentAt: null,
    };
    setState(prev => ({
      ...prev,
      quotations: [revised, ...prev.quotations],
    }));
    toast.success(`Revision ${newId} created`);
  };

  const sendQuote = (id: string) => {
    setState(prev => ({
      ...prev,
      quotations: prev.quotations.map(q => q.id === id ? { ...q, status: 'sent', sentAt: new Date().toISOString(), followupDue: new Date(Date.now() + 259200000).toISOString() } : q)
    }));
    toast.success('Quotation sent to client');
  };

  const approveQuote = (id: string) => {
    setState(prev => {
      const quotations = prev.quotations.map(q => q.id === id ? { ...q, status: 'approved' as const } : q);
      const q = quotations.find(x => x.id === id);
      
      // Rule 7: Advance Payment Gate - Create advance payment request
      if (q && q.status === 'approved') {
        const total = Math.round((q.material + q.labour) / (1 - q.margin / 100));
        const advancePayment: Payment = {
          id: `PAY-${prev.nextIds.payment}`,
          projectId: `PENDING-${q.id}`, // Project not created yet
          type: 'advance',
          amount: Math.round(total * 0.5),
          status: 'pending',
          due: new Date(Date.now() + 259200000).toISOString(),
          receivedAt: null,
          reminders: 0,
        };
        return {
          ...prev,
          quotations,
          payments: [advancePayment, ...prev.payments],
          nextIds: { ...prev.nextIds, payment: prev.nextIds.payment + 1 }
        };
      }
      return { ...prev, quotations };
    });
    toast.success('Quotation approved. Advance payment request generated.');
  };

  const createProjectFromQuote = (qId: string) => {
    const q = state.quotations.find(x => x.id === qId);
    if (!q) return;
    const id = `PRJ-${state.nextIds.project}`;
    const total = Math.round((q.material + q.labour) / (1 - q.margin / 100));
    
    const newProject: Project = {
      id,
      code: id,
      quoteId: qId,
      leadId: q.leadId,
      client: q.client,
      type: q.type,
      value: total,
      status: 'active',
      advanceReceived: false,
      designApproved: false,
      deadline: new Date(Date.now() + 2592000000).toISOString(),
      progress: 0,
      designer: 'Rahul S.',
      created: new Date().toISOString(),
    };

    const advancePayment: Payment = {
      id: `PAY-${state.nextIds.payment}`,
      projectId: id,
      type: 'advance',
      amount: Math.round(total * 0.5),
      status: 'pending',
      due: new Date(Date.now() + 259200000).toISOString(),
      receivedAt: null,
      reminders: 0,
    };

    const finalPayment: Payment = {
      id: `PAY-${state.nextIds.payment + 1}`,
      projectId: id,
      type: 'final',
      amount: Math.round(total * 0.5),
      status: 'pending',
      due: new Date(Date.now() + 2592000000).toISOString(),
      receivedAt: null,
      reminders: 0,
    };

    setState(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      payments: [...prev.payments, advancePayment, finalPayment],
      nextIds: { ...prev.nextIds, project: prev.nextIds.project + 1, payment: prev.nextIds.payment + 2 }
    }));
    toast.success(`Project ${id} created from quote`);
    setCurrentView('projects');
  };

  const downloadQuotePDF = (quoteId: string) => {
    const quote = state.quotations.find(q => q.id === quoteId);
    if (!quote) return;
    
    try {
      const doc = new jsPDF();
      const total = Math.round((quote.material + quote.labour) / (1 - quote.margin / 100));
      const marginAmt = total - quote.material - quote.labour;
      const subtotal = quote.material + quote.labour + marginAmt;
      const gstRate = 18;
      const gstAmount = Math.round(subtotal * (gstRate / 100));
      const grandTotal = subtotal + gstAmount;

      const primaryBlue: [number, number, number] = [0, 43, 91]; // #002B5B
      const lightBlue: [number, number, number] = [240, 247, 255];

      // --- Header Background ---
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 0, 210, 45, 'F');

      // --- Logo & Company Name ---
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('OFFSIDE', 14, 25);
      doc.setFontSize(10);
      doc.text('MACHINE SHOPS LLP', 14, 32);

      // --- Company Address (Right) ---
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Gem & Jewellery Park, Block No. 6 Ground Floor,', 196, 15, { align: 'right' });
      doc.text('Plot No X03 X04 X05, Gujarat Hira Bourse,', 196, 20, { align: 'right' });
      doc.text('Hazira Rd, Ichchhapor,', 196, 25, { align: 'right' });
      doc.text('Surat, 394510', 196, 30, { align: 'right' });

      // --- Contact Info Bar ---
      doc.setFillColor(0, 30, 70); // Slightly darker blue
      doc.rect(0, 38, 210, 7, 'F');
      doc.setFontSize(7);
      doc.text(`Phone: 076982 44742  ·  Email: info@offsidemachineshops.com  ·  GSTIN: 24AAAC01234F1ZP`, 105, 43, { align: 'center' });

      // --- "Quotation" Title ---
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(40);
      doc.setFont('times', 'italic'); // Using times italic as a script alternative
      doc.text('Quotation', 105, 65, { align: 'center' });
      doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setLineWidth(0.5);
      doc.line(14, 62, 75, 62);
      doc.line(135, 62, 196, 62);

      // --- Reference Info ---
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Quotation No:', 14, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(`OSMS-2024-${quote.id.padStart(3, '0')}`, 40, 80);
      doc.line(14, 82, 75, 82);

      doc.setFont('helvetica', 'bold');
      doc.text('Date:', 14, 90);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(quote.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 40, 90);
      doc.line(14, 92, 75, 92);

      doc.setFont('helvetica', 'bold');
      doc.text('Validity Until:', 14, 100);
      doc.setFont('helvetica', 'normal');
      const validityDate = new Date(quote.created);
      validityDate.setDate(validityDate.getDate() + 7);
      doc.text(validityDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 40, 100);
      doc.line(14, 102, 75, 102);

      // --- Client Info (To:) ---
      doc.setFont('helvetica', 'bold');
      doc.text('To:', 115, 80);
      doc.line(122, 80, 196, 80);
      
      doc.setFontSize(10);
      doc.text(quote.client, 115, 88);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('XYZ Enterprises', 115, 93); // Placeholder or from state if available
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('contact@client.com', 115, 98);
      doc.setTextColor(0);
      doc.text('Phone: 98765 43210', 115, 103);

      // --- Itemised Table ---
      autoTable(doc, {
        startY: 115,
        head: [['Description', 'Qty', 'Unit Price (INR)', 'Total (INR)']],
        body: [
          ['Raw Material Components & Consumables', '1', quote.material.toFixed(2), quote.material.toFixed(2)],
          ['Labour, Fabrication & Machining Services', '1', quote.labour.toFixed(2), quote.labour.toFixed(2)],
          ['Overheads, Logistics & Service Margin', '1', marginAmt.toFixed(2), marginAmt.toFixed(2)],
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryBlue, fontSize: 10, cellPadding: 4, halign: 'center' },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' },
        },
        alternateRowStyles: { fillColor: lightBlue }
      });

      // --- Financials ---
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 150, finalY + 15, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${subtotal.toLocaleString('en-IN')}.00`, 196, finalY + 15, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.text(`GST @ ${gstRate}%:`, 150, finalY + 25, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`${gstAmount.toLocaleString('en-IN')}.00`, 196, finalY + 25, { align: 'right' });
      
      // Grand Total Box
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(105, finalY + 32, 91, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Grand Total (INR):', 110, finalY + 39);
      doc.text(`${grandTotal.toLocaleString('en-IN')}.00`, 191, finalY + 39, { align: 'right' });

      // --- Footer: Terms & Signature ---
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions:', 14, finalY + 55);
      doc.line(14, 57, 75, 57);
      
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text('1. 50% advance payment required to start fabrication.', 14, finalY + 62);
      doc.text('2. Delivery within 15-20 days from design approval.', 14, finalY + 67);
      doc.text('3. Quote valid for 7 days from date of issue.', 14, finalY + 72);

      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.text('Thank you for considering our offer.', 196, finalY + 55, { align: 'right' });

      // Signature
      doc.setDrawColor(200);
      doc.line(125, finalY + 85, 196, finalY + 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Authorized Signature', 160, finalY + 90, { align: 'center' });

      // --- Bottom Banner ---
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 275, 210, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('We specialise in providing high-quality fabrication work', 105, 285, { align: 'center' });
      doc.text('to meet all your project needs.', 105, 292, { align: 'center' });

      const fileName = `Quotation_${quote.id}_${(quote.client || '').replace(/\s+/g, '_')}.pdf`;
      const pdfDataUri = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
        newWindow.document.title = fileName;
        toast.success(`Quotation PDF for ${quote.client} opened in new tab!`);
      } else {
        doc.save(fileName);
        toast.success(`Quotation PDF for ${quote.client} downloaded!`);
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF. Please check browser permissions.');
    }
  };

  const downloadInvoicePDF = (invoiceId: string) => {
    const invoice = state.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    try {
      const doc = new jsPDF();
      const primaryBlue: [number, number, number] = [0, 43, 91]; // #002B5B
      const lightBlue: [number, number, number] = [240, 247, 255];

      // --- Header Background ---
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 0, 210, 45, 'F');

      // --- Logo & Company Name ---
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('OFFSIDE', 14, 25);
      doc.setFontSize(10);
      doc.text('MACHINE SHOPS LLP', 14, 32);

      // --- Company Address (Right) ---
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Gem & Jewellery Park, Block No. 6 Ground Floor,', 196, 15, { align: 'right' });
      doc.text('Plot No X03 X04 X05, Gujarat Hira Bourse,', 196, 20, { align: 'right' });
      doc.text('Hazira Rd, Ichchhapor,', 196, 25, { align: 'right' });
      doc.text('Surat, 394510', 196, 30, { align: 'right' });

      // --- Contact Info Bar ---
      doc.setFillColor(0, 30, 70); // Slightly darker blue
      doc.rect(0, 38, 210, 7, 'F');
      doc.setFontSize(7);
      doc.text(`Phone: 076982 44742  ·  Email: info@offsidemachineshops.com  ·  GSTIN: 24AAAC01234F1ZP`, 105, 43, { align: 'center' });
      
      // --- "Tax Invoice" Title ---
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(36);
      doc.setFont('times', 'italic');
      doc.text('Tax Invoice', 105, 65, { align: 'center' });
      doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setLineWidth(0.5);
      doc.line(14, 62, 75, 62);
      doc.line(135, 62, 196, 62);
      
      // --- Reference Info ---
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice No:', 14, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.id, 40, 80);
      doc.line(14, 82, 75, 82);

      doc.setFont('helvetica', 'bold');
      doc.text('Date:', 14, 90);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(invoice.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 40, 90);
      doc.line(14, 92, 75, 92);

      doc.setFont('helvetica', 'bold');
      doc.text('Due Date:', 14, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 40, 100);
      doc.line(14, 102, 75, 102);

      // --- Client Details (BILL TO:) ---
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 115, 80);
      doc.line(122, 80, 196, 80);
      
      doc.setFontSize(10);
      doc.text(invoice.client, 115, 88);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Project ID: ${invoice.projectId}`, 115, 93);
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text('contact@client.com', 115, 98);
      doc.setTextColor(0);
      doc.text('Phone: 98765 43210', 115, 103);

      // --- Itemised Table ---
      autoTable(doc, {
        startY: 115,
        head: [['Description', 'Qty', 'Rate', 'GST', 'Total (INR)']],
        body: invoice.items.map(item => [
          item.description,
          item.qty,
          `₹${item.rate.toLocaleString('en-IN')}`,
          `${item.gst}%`,
          `₹${(item.qty * item.rate * (1 + item.gst / 100)).toLocaleString('en-IN')}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: primaryBlue, fontSize: 10, cellPadding: 4, halign: 'center' },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'center' },
          4: { halign: 'right' },
        },
        alternateRowStyles: { fillColor: lightBlue }
      });

      // --- Financial Breakdown ---
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 150, finalY + 15, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`₹${invoice.subTotal.toLocaleString('en-IN')}.00`, 196, finalY + 15, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.text('GST Total:', 150, finalY + 22, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(`₹${invoice.gstTotal.toLocaleString('en-IN')}.00`, 196, finalY + 22, { align: 'right' });
      
      // Grand Total Box
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(105, finalY + 32, 91, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Grand Total (INR):', 110, finalY + 39);
      doc.text(`₹${invoice.totalAmount.toLocaleString('en-IN')}.00`, 191, finalY + 39, { align: 'right' });

      // --- Footer: Terms & Signature ---
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions:', 14, finalY + 55);
      doc.line(14, 57, 75, 57);
      
      doc.setFontSize(8);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
      doc.text('1. 50% advance payment required to start fabrication.', 14, finalY + 62);
      doc.text('2. Delivery within 15-20 days from design approval.', 14, finalY + 67);
      doc.text('3. Quote valid for 7 days from date of issue.', 14, finalY + 72);

      // Signature Space
      doc.setDrawColor(200);
      doc.line(125, finalY + 85, 196, finalY + 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('Authorized Signature', 160, finalY + 90, { align: 'center' });

      // --- Bottom Banner ---
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 275, 210, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('We specialise in providing high-quality fabrication work', 105, 285, { align: 'center' });
      doc.text('to meet all your project needs.', 105, 292, { align: 'center' });

      const fileName = `Invoice_${invoice.id}_${(invoice.client || '').replace(/\s+/g, '_')}.pdf`;
      const pdfDataUri = doc.output('datauristring');
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
        newWindow.document.title = fileName;
        toast.success(`Invoice ${invoice.id} opened in new tab!`);
      } else {
        doc.save(fileName);
        toast.success(`Invoice ${invoice.id} downloaded!`);
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate Invoice. Please check browser permissions.');
    }
  };

  const addInventoryItem = (data: Partial<InventoryItem>) => {
    const id = `INV-${state.nextIds.inv}`;
    const newItem: InventoryItem = {
      id,
      name: data.name || '',
      category: data.category || 'raw_material',
      qty: data.qty || 0,
      unit: data.unit || 'kg',
      threshold: data.threshold || 10,
      rate: data.rate || 0,
    };
    setState(prev => ({
      ...prev,
      inventory: [newItem, ...prev.inventory],
      nextIds: { ...prev.nextIds, inv: prev.nextIds.inv + 1 }
    }));
    setModalType(null);
    toast.success(`Item ${newItem.name} added to inventory`);
  };

  const updateInventoryQty = (id: string, delta: number) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          return {
            ...item,
            qty: newQty,
          };
        }
        return item;
      })
    }));
    toast.success('Inventory updated');
  };

  const addMaterialRequest = (projectId: string) => {
    const id = `MR-${state.nextIds.mr}`;
    const newMR: MaterialRequest = {
      id,
      projectId,
      taskId: 'T-0',
      itemId: 'INV-1',
      qty: 5,
      status: 'pending',
      requestedBy: 'Mayur',
      issuedAt: null,
      created: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      materialRequests: [newMR, ...prev.materialRequests],
      nextIds: { ...prev.nextIds, mr: prev.nextIds.mr + 1 }
    }));
    toast.success(`Material request ${id} raised`);
  };

  const addQCCheck = (projectId: string) => {
    const id = `QC-${state.nextIds.qc}`;
    const newQC: QCCheck = {
      id,
      projectId,
      taskId: 'T-0',
      checkedBy: 'Mayur',
      items: [
        { label: 'Dimensions', passed: null },
        { label: 'Welding Quality', passed: null },
        { label: 'Surface Finish', passed: null },
        { label: 'Material Grade', passed: null },
      ],
      result: 'pending',
      reworkNotes: '',
      checkedAt: null,
    };
    setState(prev => ({
      ...prev,
      qcChecks: [newQC, ...prev.qcChecks],
      nextIds: { ...prev.nextIds, qc: prev.nextIds.qc + 1 }
    }));
    toast.success(`QC check ${id} scheduled`);
    setCurrentView('qc');
  };

  const addTask = (projectId: string, type: TaskType) => {
    const id = `T-${state.nextIds.task}`;
    const newTask: Task = {
      id,
      projectId,
      type,
      title: `${type} for ${projectId}`,
      assignee: 'Floor Team A',
      status: 'pending',
      progress: 0,
      due: new Date(Date.now() + 604800000).toISOString(),
    };
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      nextIds: { ...prev.nextIds, task: prev.nextIds.task + 1 }
    }));
    toast.success(`Task ${type} added to project`);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setState(prev => {
      const leads = prev.leads.map(l => l.id === id ? { 
        ...l, 
        ...updates, 
        lastActivity: new Date().toISOString(),
        activityLogs: updates.stage ? [
          ...(l.activityLogs || []), 
          { id: `AL-${Date.now()}`, type: 'system', content: `Stage changed to ${updates.stage}`, timestamp: new Date().toISOString(), performedBy: state.currentUser.name }
        ] : l.activityLogs
      } : l);
      const lead = leads.find(l => l.id === id);
      
      // Rule 3: Requirement Completed -> Create Quotation Request
      if (lead && updates.stage === 'requirement_collected') {
        const quoteId = `Q-${prev.nextIds.quote}`;
        const newQuote: Quotation = {
          id: quoteId,
          leadId: lead.id,
          client: lead.client,
          type: lead.type,
          version: 1,
          material: 0,
          labour: 0,
          margin: 20,
          status: 'draft',
          created: new Date().toISOString(),
          sentAt: null,
          followupDue: null,
        };
        return {
          ...prev,
          leads,
          quotations: [newQuote, ...prev.quotations],
          nextIds: { ...prev.nextIds, quote: prev.nextIds.quote + 1 }
        };
      }
      return { ...prev, leads };
    });
    toast.success('Lead updated');
  };

  const addLead = (data: Partial<Lead>) => {
    const id = `L-${state.nextIds.lead}`;
    const availableAgents = state.users.filter(u => u.status === 'active' && (u.role === 'manager' || u.role === 'admin'));
    const sortedAgents = [...availableAgents].sort((a, b) => a.currentLeadCount - b.currentLeadCount);
    const bestAgent = sortedAgents[0];

    const newLead: Lead = {
      id,
      client: data.client || 'New Client',
      phone: data.phone || '',
      type: data.type || 'Requirement TBD',
      value: data.value || 0,
      temp: data.temp || 'warm',
      stage: 'new',
      followup: data.followup || new Date(Date.now() + 86400000).toISOString(),
      lastActivity: new Date().toISOString(),
      assignedTo: bestAgent ? bestAgent.name : '',
      createdBy: state.currentUser.name,
      created: new Date().toISOString(),
      autoReminder: true,
      activityLogs: [{ id: 'AL-INIT', type: 'system', content: 'Lead created' + (bestAgent ? ` and auto-assigned to ${bestAgent.name}` : ''), timestamp: new Date().toISOString(), performedBy: state.currentUser.name }]
    };

    // Start Nurturing Sequence
    const initialSequenceStatus: LeadSequenceStatus = {
      leadId: id,
      sequenceId: 'SEQ-001',
      currentStepIndex: 0,
      lastStepSentAt: new Date().toISOString(),
      status: 'active'
    };

    setState(prev => ({
      ...prev,
      leads: [newLead, ...prev.leads],
      users: bestAgent ? prev.users.map(u => u.id === bestAgent.id ? { ...u, currentLeadCount: u.currentLeadCount + 1 } : u) : prev.users,
      leadSequenceStatuses: [...prev.leadSequenceStatuses, initialSequenceStatus],
      nextIds: { ...prev.nextIds, lead: prev.nextIds.lead + 1 }
    }));

    if (bestAgent) {
      toast.success(`Lead auto-assigned to ${bestAgent.name}`);
    }
    setModalType(null);
    toast.success(`Lead ${id} created for ${newLead.client}`);
  };

  const markPaymentReceived = (id: string) => {
    setState(prev => {
      const payment = prev.payments.find(p => p.id === id);
      if (!payment) return prev;

      const newPayments = prev.payments.map(pay => pay.id === id ? { ...pay, status: 'received' as const, receivedAt: new Date().toISOString() } : pay);
      
      // Rule 9: Auto Project Creation on Advance Payment
      if (payment.type === 'advance' && payment.projectId?.startsWith('PENDING-')) {
        const quoteId = payment.projectId.replace('PENDING-', '');
        const { project, payments: extraPayments } = autoCreateProject(quoteId, { ...prev, payments: newPayments });
        
        // Update the advance payment to point to the real project ID
        const updatedPayments = newPayments.map(p => p.id === id ? { ...p, projectId: project.id } : p);
        
        return {
          ...prev,
          projects: [project, ...prev.projects],
          payments: [...extraPayments, ...updatedPayments],
          nextIds: { 
            ...prev.nextIds, 
            project: prev.nextIds.project + 1, 
            payment: prev.nextIds.payment + extraPayments.length 
          }
        };
      }

      const newProjects = prev.projects.map(proj => {
        if (proj.id === payment.projectId && payment.type === 'advance') {
          return { ...proj, advanceReceived: true };
        }
        return proj;
      });
      return { ...prev, payments: newPayments, projects: newProjects };
    });
    toast.success('Payment received and processed');
  };

  const approveDesign = (id: string) => {
    setState(prev => {
      const projects = prev.projects.map(p => p.id === id ? { ...p, designApproved: true } : p);
      
      // Rule 12: Auto Task Breakdown on Design Approval
      const newTasks = autoCreateTasks(id, prev);
      
      return {
        ...prev,
        projects,
        tasks: [...prev.tasks, ...newTasks],
        nextIds: { ...prev.nextIds, task: prev.nextIds.task + newTasks.length }
      };
    });
    toast.success('Design approved. Production tasks generated.');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => {
      const newTasks = prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
      const task = newTasks.find(t => t.id === id);
      if (task) {
        const projectTasks = newTasks.filter(t => t.projectId === task.projectId);
        const avgProgress = Math.round(projectTasks.reduce((s, t) => s + t.progress, 0) / (projectTasks.length || 1));
        const newProjects = prev.projects.map(p => p.id === task.projectId ? { ...p, progress: avgProgress } : p);
        return { ...prev, tasks: newTasks, projects: newProjects };
      }
      return { ...prev, tasks: newTasks };
    });
  };

  const toggleQCItem = (qcId: string, idx: number) => {
    setState(prev => ({
      ...prev,
      qcChecks: prev.qcChecks.map(qc => {
        if (qc.id === qcId) {
          const newItems = [...qc.items];
          const item = newItems[idx];
          if (item.passed === null) item.passed = true;
          else if (item.passed === true) item.passed = false;
          else item.passed = null;
          return { ...qc, items: newItems };
        }
        return qc;
      })
    }));
  };

  const setQCResult = (qcId: string, result: QCResult) => {
    setState(prev => ({
      ...prev,
      qcChecks: prev.qcChecks.map(qc => qc.id === qcId ? { ...qc, result, checkedAt: new Date().toISOString() } : qc)
    }));
    toast.success(`QC marked as ${result}`);
  };

  const dispatchProject = (projectId: string) => {
    const id = `DSP-${state.nextIds.dsp}`;
    const newDispatch: Dispatch = {
      id,
      projectId,
      qcId: '',
      paymentCleared: true,
      status: 'dispatched',
      dispatched: new Date().toISOString(),
      deliveredAt: null,
    };
    setState(prev => ({
      ...prev,
      dispatches: [newDispatch, ...prev.dispatches],
      nextIds: { ...prev.nextIds, dsp: prev.nextIds.dsp + 1 }
    }));
    toast.success('Project dispatched');
  };

  const deliverProject = (id: string) => {
    setState(prev => {
      const dsp = prev.dispatches.find(d => d.id === id);
      const newDispatches = prev.dispatches.map(d => d.id === id ? { ...d, status: 'delivered' as const, deliveredAt: new Date().toISOString() } : d);
      const newProjects = prev.projects.map(p => p.id === dsp?.projectId ? { ...p, status: 'completed' as const } : p);
      
      // Auto-generate invoice when project is completed
      let finalState = { ...prev, dispatches: newDispatches, projects: newProjects };
      if (dsp?.projectId) {
        finalState = generateInvoiceFromProject(dsp.projectId, finalState);
      }
      
      return finalState;
    });
    toast.success('Project delivered. Final invoice generated.');
  };

  const handleReceivePO = (id: string) => {
    setState(prev => receivePO(id, prev));
    toast.success(`PO ${id} received. Inventory updated.`);
  };

  const handleIssueMaterial = (id: string) => {
    const newState = processMaterialIssue(id, state);
    if (newState === state) {
      toast.error('Insufficient stock or invalid request');
    } else {
      setState(newState);
      toast.success('Material issued successfully');
    }
  };

  const handleMarkInvoicePaid = (id: string) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => inv.id === id ? { ...inv, status: 'paid' } : inv)
    }));
    toast.success(`Invoice ${id} marked as paid`);
  };

  const addPurchaseOrder = (data: Partial<PurchaseOrder>) => {
    const id = `PO-${state.nextIds.po}`;
    const newPO: PurchaseOrder = {
      id,
      supplierId: data.supplierId || '',
      items: data.items || [],
      totalAmount: data.totalAmount || 0,
      status: 'draft',
      expectedDelivery: data.expectedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      receivedAt: null,
      created: new Date().toISOString(),
    };

    setState(prev => {
      let newState = {
        ...prev,
        purchaseOrders: [newPO, ...prev.purchaseOrders],
        nextIds: { ...prev.nextIds, po: prev.nextIds.po + 1 }
      };

      // If this PO was raised from an MR, update the MR status
      if (selectedMRId) {
        newState.materialRequests = newState.materialRequests.map(mr => 
          mr.id === selectedMRId ? { ...mr, status: 'purchase_raised' } : mr
        );
      }

      return newState;
    });

    setModalType(null);
    setSelectedMRId(null);
    setCurrentView('purchase');
    toast.success(`Purchase Order ${id} created as draft`);
  };

  const handleRaisePO = (mrId: string) => {
    setSelectedMRId(mrId);
    setModalType('new_po');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
    { id: 'workflow', label: 'End-to-End Flow', icon: Workflow, color: 'text-indigo-600' },
    { id: 'designer-flow', label: 'Designer Flow', icon: Sparkles, color: 'text-violet-600', badge: state.designerProjects.filter(p => p.status !== 'completed').length },
    { id: 'crm', label: 'CRM / Sales', icon: Users, color: 'text-orange-600', badge: state.leads.filter(l => l.stage === 'new').length },
    { id: 'hr', label: 'HR / Vacancies', icon: Briefcase, color: 'text-blue-600', badge: state.vacancies.filter(v => v.status === 'open').length },
    { id: 'marketing', label: 'Marketing', icon: Share2, color: 'text-pink-600', badge: state.marketingProjects.filter(p => p.status === 'in_progress').length },
    { id: 'quotations', label: 'Quotations', icon: FileText, color: 'text-purple-600' },
    { id: 'invoices', label: 'Invoices', icon: IndianRupee, color: 'text-green-600' },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'text-emerald-600', badge: state.payments.filter(p => p.status === 'overdue').length },
    { id: 'projects', label: 'Projects', icon: Briefcase, color: 'text-indigo-600' },
    { id: 'production', label: 'Production', icon: Factory, color: 'text-amber-600' },
    { id: 'inventory', label: 'Inventory', icon: Package, color: 'text-cyan-600', badge: state.inventory.filter(i => i.qty <= i.threshold).length },
    { id: 'purchase', label: 'Purchase', icon: ShoppingCart, color: 'text-rose-600' },
    { id: 'qc', label: 'Quality Control', icon: ShieldCheck, color: 'text-teal-600' },
    { id: 'dispatch', label: 'Dispatch', icon: Truck, color: 'text-slate-600' },
    { id: 'reports', label: 'Reports', icon: BarChart3, color: 'text-pink-600' },
    { id: 'users', label: 'Team', icon: Shield, color: 'text-gray-600' },
  ];

  const activeProjects = useMemo(() => state.projects.filter(p => p.status === 'active'), [state.projects]);
  const totalRevenue = useMemo(() => state.payments.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0), [state.payments]);
  const pendingRevenue = useMemo(() => state.payments.filter(p => p.status !== 'received').reduce((sum, p) => sum + p.amount, 0), [state.payments]);
  const totalQuotes = useMemo(() => state.quotations.length, [state.quotations]);

  // Rule 2: No Follow-up Alert (48h)
  const neglectedLeads = useMemo(() => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    return state.leads.filter(l => l.stage !== 'approved' && l.stage !== 'lost' && new Date(l.lastActivity) < fortyEightHoursAgo);
  }, [state.leads]);

  // Rule 18: Delay Detection
  const delayedTasks = useMemo(() => {
    return state.tasks.filter(t => t.status !== 'done' && new Date(t.due) < new Date());
  }, [state.tasks]);

  const resetSystem = () => {
    if (window.confirm('Are you sure you want to reset all data to initial state? This cannot be undone.')) {
      localStorage.removeItem('fabrication_erp_state');
      window.location.reload();
    }
  };

  const getNextStep = (project: Project) => {
    if (!project.advanceReceived) return { label: 'Collect Advance', color: 'text-red-600', icon: CreditCard };
    if (!project.designApproved) return { label: 'Approve Design', color: 'text-blue-600', icon: FileText };
    if (project.progress < 100) return { label: 'Monitor Production', color: 'text-amber-600', icon: Factory };
    const qc = state.qcChecks.find(q => q.projectId === project.id);
    if (!qc || qc.result === 'pending') return { label: 'Perform QC', color: 'text-purple-600', icon: ShieldCheck };
    if (qc.result === 'fail') return { label: 'Fix QC Issues', color: 'text-red-600', icon: AlertTriangle };
    return { label: 'Ready for Dispatch', color: 'text-green-600', icon: Truck };
  };

  const renderWorkflow = () => {
    const openLeads = state.leads.filter(l => l.stage !== 'approved' && l.stage !== 'lost');
    const activeQuotes = state.quotations.filter(q => q.status === 'draft' || q.status === 'sent' || q.status === 'approved');
    const advanceBlocked = state.projects.filter(p => p.status === 'active' && !p.advanceReceived);
    const designBlocked = state.projects.filter(p => p.status === 'active' && p.advanceReceived && !p.designApproved);
    const productionLive = state.projects.filter(p => p.status === 'active' && p.advanceReceived && p.designApproved && p.progress < 100);
    const materialBlocked = state.materialRequests.filter(m => m.status === 'pending' || m.status === 'purchase_raised');
    const qcPending = state.qcChecks.filter(q => q.result === 'pending' || q.result === 'rework' || q.result === 'fail');
    const dispatchReady = state.projects.filter(p => p.status === 'active' && canDispatch(p.id, state).ok);
    const collectionPending = state.payments.filter(p => p.status !== 'received');
    const completedProjects = state.projects.filter(p => p.status === 'completed');

    const stages = [
      {
        label: 'Sales Intake',
        view: 'crm',
        icon: Users,
        count: openLeads.length,
        status: openLeads.length ? 'Active' : 'Clear',
        detail: 'Lead capture, assignment, WhatsApp follow-up, pipeline movement',
        action: 'Open CRM',
        tone: 'bg-orange-50 text-orange-700 border-orange-100'
      },
      {
        label: 'Quotation',
        view: 'quotations',
        icon: FileText,
        count: activeQuotes.length,
        status: activeQuotes.some(q => q.status === 'approved') ? 'Approved quotes waiting' : 'In progress',
        detail: 'Draft, send, revise, approve, and export client quotations',
        action: 'Manage Quotes',
        tone: 'bg-purple-50 text-purple-700 border-purple-100'
      },
      {
        label: 'Payment Gate',
        view: 'payments',
        icon: CreditCard,
        count: advanceBlocked.length,
        status: advanceBlocked.length ? 'Blocked' : 'Passed',
        detail: 'Advance collection unlocks project execution and task creation',
        action: 'Collect Payments',
        tone: advanceBlocked.length ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
      },
      {
        label: 'Design Gate',
        view: 'projects',
        icon: Briefcase,
        count: designBlocked.length,
        status: designBlocked.length ? 'Approval needed' : 'Ready',
        detail: 'Client design approval before production tasks move forward',
        action: 'Review Projects',
        tone: designBlocked.length ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'
      },
      {
        label: 'Production',
        view: 'production',
        icon: Factory,
        count: productionLive.length,
        status: delayedTasks.length ? `${delayedTasks.length} delayed` : 'On floor',
        detail: 'Procurement, cutting, welding, finishing, and QC task progress',
        action: 'Track Floor',
        tone: delayedTasks.length ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-700 border-slate-100'
      },
      {
        label: 'Material Control',
        view: 'inventory',
        icon: Package,
        count: materialBlocked.length,
        status: materialBlocked.length ? 'Action needed' : 'Stock flowing',
        detail: 'Material requests, stock issue, low-stock alerts, wastage, PO raise',
        action: 'Open Inventory',
        tone: materialBlocked.length ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-green-50 text-green-700 border-green-100'
      },
      {
        label: 'Purchase',
        view: 'purchase',
        icon: ShoppingCart,
        count: state.purchaseOrders.filter(po => po.status === 'draft' || po.status === 'sent').length,
        status: 'Supplier flow',
        detail: 'Supplier orders, expected delivery, receiving, and stock update',
        action: 'Manage PO',
        tone: 'bg-rose-50 text-rose-700 border-rose-100'
      },
      {
        label: 'QC Gate',
        view: 'qc',
        icon: ShieldCheck,
        count: qcPending.length,
        status: qcPending.length ? 'Inspection pending' : 'Passed queue',
        detail: 'Checklist-based pass, fail, or rework before dispatch',
        action: 'Run QC',
        tone: qcPending.length ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-green-50 text-green-700 border-green-100'
      },
      {
        label: 'Dispatch',
        view: 'dispatch',
        icon: Truck,
        count: dispatchReady.length,
        status: dispatchReady.length ? 'Ready now' : 'Waiting gates',
        detail: 'Dispatch only when QC is passed and all project payments are clear',
        action: 'Dispatch Control',
        tone: dispatchReady.length ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-700 border-slate-100'
      },
      {
        label: 'Invoice & Reports',
        view: 'invoices',
        icon: IndianRupee,
        count: completedProjects.length,
        status: collectionPending.length ? 'Collection pending' : 'Closed',
        detail: 'Invoice generation, payment status, revenue, profit, and analytics',
        action: 'Open Invoices',
        tone: collectionPending.length ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'
      }
    ];

    const gateRows = [
      ...advanceBlocked.map(p => ({ id: p.id, owner: p.client, gate: 'Advance payment not received', view: 'payments', severity: 'Hard Gate' })),
      ...designBlocked.map(p => ({ id: p.id, owner: p.client, gate: 'Design approval pending', view: 'projects', severity: 'Gate' })),
      ...state.projects.filter(p => p.status === 'active' && !canDispatch(p.id, state).ok).slice(0, 5).map(p => ({
        id: p.id,
        owner: p.client,
        gate: canDispatch(p.id, state).reason,
        view: 'dispatch',
        severity: 'Dispatch Gate'
      }))
    ];

    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Workflow className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Brain Flow</span>
                </div>
                <CardTitle className="text-2xl">Lead to Dispatch, One Connected Control Room</CardTitle>
                <CardDescription className="mt-1">
                  Every module below is a working station in the same business pipeline.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setModalType('new_lead')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Lead
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('reports')} className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Reports
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Flow Items</div>
                <div className="text-2xl font-bold mt-1">{openLeads.length + activeQuotes.length + activeProjects.length}</div>
              </div>
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-500">Blocked Gates</div>
                <div className="text-2xl font-bold text-red-700 mt-1">{advanceBlocked.length + designBlocked.length}</div>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Collection</div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{collectionPending.length}</div>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-green-600">Ready Dispatch</div>
                <div className="text-2xl font-bold text-green-700 mt-1">{dispatchReady.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {stages.map((stage, index) => (
            <Card key={stage.label} className="relative overflow-hidden border-slate-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stage.tone}`}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{String(index + 1).padStart(2, '0')}</Badge>
                </div>
                <div className="space-y-1 min-h-[88px]">
                  <h3 className="text-sm font-bold">{stage.label}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stage.count}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stage.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{stage.detail}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => setCurrentView(stage.view)}
                >
                  {stage.action}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Project Flow Board</CardTitle>
              <CardDescription>Current active projects and the next station they need.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Next Step</TableHead>
                    <TableHead className="text-right">Open</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeProjects.slice(0, 8).map(project => {
                    const next = getNextStep(project);
                    const targetView =
                      next.label === 'Collect Advance' ? 'payments' :
                      next.label === 'Approve Design' ? 'projects' :
                      next.label === 'Monitor Production' ? 'production' :
                      next.label === 'Perform QC' || next.label === 'Fix QC Issues' ? 'qc' :
                      'dispatch';
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-mono text-xs">{project.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{project.client}</div>
                          <div className="text-xs text-slate-400">{project.type}</div>
                        </TableCell>
                        <TableCell className="w-[160px]">
                          <div className="space-y-1">
                            <Progress value={project.progress} className="h-1.5" />
                            <div className="text-[10px] text-slate-500">{project.progress}% complete</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 text-xs font-bold ${next.color}`}>
                            <next.icon className="w-4 h-4" />
                            {next.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setCurrentView(targetView)}>
                            Go
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gate Register</CardTitle>
              <CardDescription>Where the flow is currently stopped.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {gateRows.length > 0 ? gateRows.slice(0, 8).map(row => (
                <button
                  key={`${row.id}-${row.gate}`}
                  onClick={() => setCurrentView(row.view)}
                  className="w-full text-left rounded-lg border border-red-100 bg-red-50 p-3 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-red-900">{row.id}</span>
                    <Badge variant="destructive" className="text-[9px]">{row.severity}</Badge>
                  </div>
                  <div className="text-xs text-red-700 mt-1">{row.gate}</div>
                  <div className="text-[10px] text-red-500 mt-1">{row.owner}</div>
                </button>
              )) : (
                <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-700">
                  No blocking gates right now.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const overdueLeads = state.leads.filter(l => l.stage !== 'approved' && l.stage !== 'lost' && new Date(l.followup) < new Date());
    const pendingPayments = state.payments.filter(p => p.status !== 'received');
    const delayedProjects = state.projects.filter(p => p.status === 'active' && new Date(p.deadline) < new Date());
    const lowStock = state.inventory.filter(i => i.qty <= i.threshold);

    return (
      <div className="space-y-6">
        {/* Quick Actions - Easy to Use */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={addLead}
            className="h-auto py-4 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md shadow-blue-500/20"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">New Lead</span>
          </Button>
          <Button 
            onClick={() => setModalType('new_quote')}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:bg-slate-50"
          >
            <FileText className="w-6 h-6 text-slate-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Create Quote</span>
          </Button>
          <Button 
            onClick={() => setCurrentView('inventory')}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:bg-slate-50"
          >
            <Package className="w-6 h-6 text-slate-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Inventory</span>
          </Button>
          <Button 
            onClick={() => setCurrentView('hr')}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:bg-slate-50"
          >
            <Briefcase className="w-6 h-6 text-slate-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Vacancies</span>
          </Button>
          <Button 
            onClick={() => setCurrentView('payments')}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:bg-slate-50"
          >
            <CreditCard className="w-6 h-6 text-slate-600" />
            <span className="text-xs font-bold uppercase tracking-wider">Payments</span>
          </Button>
        </div>

        {/* Daily Briefing - Smart Assistant */}
        <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Smart Briefing</span>
            </div>
            <CardTitle className="text-2xl font-bold">Good Morning, Mayur</CardTitle>
            <CardDescription className="text-slate-400">Here is what needs your attention today:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${overdueLeads.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{overdueLeads.length} Overdue Leads</p>
                    <p className="text-[10px] text-slate-400">Needs follow-up call</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pendingPayments.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{pendingPayments.length} Pending Payments</p>
                    <p className="text-[10px] text-slate-400">₹{(pendingRevenue / 100000).toFixed(2)}L to collect</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${delayedProjects.length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{delayedProjects.length} Delayed Projects</p>
                    <p className="text-[10px] text-slate-400">Check production floor</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lowStock.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{lowStock.length} Low Stock Items</p>
                    <p className="text-[10px] text-slate-400">Reorder required soon</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${state.vacancies.filter(v => v.status === 'open').length > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">{state.vacancies.filter(v => v.status === 'open').length} Open Vacancies</p>
                    <p className="text-[10px] text-slate-400">{state.candidates.filter(c => c.currentStage === 'applied').length} New Applications</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider"
                  onClick={() => setCurrentView('production')}
                >
                  Start Daily Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Projects</CardDescription>
            <CardTitle className="text-3xl font-bold">{activeProjects.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-600 font-medium">Running now</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Revenue (Collected)</CardDescription>
            <CardTitle className="text-3xl font-bold">₹{(totalRevenue / 100000).toFixed(2)}L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 font-medium">Total collections</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Delayed Projects</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600">{state.projects.filter(p => p.status === 'active' && new Date(p.deadline) < new Date()).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-red-600 font-medium">Past deadline</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Pending Payments</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-600">₹{(pendingRevenue / 100000).toFixed(2)}L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-amber-600 font-medium">{state.payments.filter(p => p.status !== 'received').length} payments</div>
          </CardContent>
        </Card>
        <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">Total Quotations</CardDescription>
            <CardTitle className="text-3xl font-bold">{totalQuotes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-500 font-medium">System Brain Active</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
              <CardDescription>Real-time production status</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentView('projects')}>View all</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Next Step</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeProjects.slice(0, 5).map((project) => {
                  const isOverdue = new Date(project.deadline) < new Date();
                  const nextStep = getNextStep(project);
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-xs text-slate-500">{project.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{project.client}</div>
                        <div className="text-xs text-slate-400">{project.type}</div>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <div className="space-y-1">
                          <Progress value={project.progress} className="h-1.5" />
                          <div className="text-[10px] text-slate-500">{project.progress}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOverdue ? (
                          <Badge variant="destructive" className="text-[10px] h-5">Overdue</Badge>
                        ) : (
                          <span className="text-xs text-slate-600">{new Date(project.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${nextStep.color}`}>
                          <nextStep.icon className="w-3 h-3" />
                          {nextStep.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setCurrentView('production')}>Track</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Control Gates</CardTitle>
              <CardDescription>System-enforced blocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.projects.filter(p => !p.advanceReceived && p.status === 'active').map(p => (
                <div key={p.id} className="flex items-start gap-3 p-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="text-xs font-medium">{p.id} advance pending — work blocked</div>
                </div>
              ))}
              {state.dispatches.filter(d => d.status === 'blocked').map(d => (
                <div key={d.id} className="flex items-start gap-3 p-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="text-xs font-medium">{d.id} dispatch blocked — payment pending</div>
                </div>
              ))}
              {state.qcChecks.filter(q => q.result === 'pass').slice(0, 2).map(q => (
                <div key={q.id} className="flex items-start gap-3 p-2 rounded-lg bg-green-50 border border-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="text-xs font-medium">{q.projectId} QC passed</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Live Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {neglectedLeads.map(l => (
                <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-xs font-medium text-red-800">{l.client} - No activity 48h+</div>
                  <Badge variant="destructive" className="text-[8px] h-4">Escalated</Badge>
                </div>
              ))}
              {delayedTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-xs font-medium text-amber-800">{t.id} delayed</div>
                  <div className="text-[10px] text-amber-600 font-mono">Alert</div>
                </div>
              ))}
              {state.inventory.filter(i => i.qty <= i.threshold).map(i => (
                <div key={i.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                  <div className="text-xs font-medium text-red-800">{i.name} low stock</div>
                  <div className="text-[10px] text-red-600 font-mono">{i.qty} {i.unit}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Rule 30: Worker Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Team Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Floor Team A', speed: 92, quality: 98 },
                { name: 'Design Team', speed: 85, quality: 95 },
                { name: 'Sales Team', speed: 78, quality: 90 },
              ].map(team => (
                <div key={team.name} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-medium">
                    <span>{team.name}</span>
                    <span className="text-blue-600">Rank #1</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[8px] text-slate-400">Speed</div>
                      <Progress value={team.speed} className="h-1 bg-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] text-slate-400">Quality</div>
                      <Progress value={team.quality} className="h-1 bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f8f7] text-[#1a1a18] font-sans overflow-hidden">
      <Toaster position="bottom-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-bottom border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">SB</div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">System Brain</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Fabrication ERP</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-6">
            <div>
              <h2 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Overview</h2>
              <div className="space-y-1">
                {navItems.slice(0, 2).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                      currentView === item.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Sales</h2>
              <div className="space-y-1">
                {navItems.slice(2, 4).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                      currentView === item.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge ? (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Operations</h2>
              <div className="space-y-1">
                {navItems.slice(4).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                      currentView === item.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge ? (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">M</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Mayur</p>
              <p className="text-[10px] text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <button 
            onClick={resetSystem}
            className="w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{navItems.find(i => i.id === currentView)?.label}</h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              {currentView === 'dashboard'
                ? 'Live overview - All rules active'
                : currentView === 'workflow'
                  ? 'Lead to dispatch command flow'
                  : currentView === 'designer-flow'
                    ? 'Automated designer bidding and approval flow'
                  : `Section: ${currentView}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Action
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f8f7]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && renderDashboard()}
              {currentView === 'workflow' && renderWorkflow()}
              {currentView === 'designer-flow' && (
                <DesignerWorkflowView
                  projects={state.designerProjects.filter(project =>
                    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )}
                  designers={state.designers}
                  bids={state.designerBids}
                  events={state.designerWorkflowEvents}
                  onCreateProject={(input) => {
                    setState(prev => createDesignerProject(prev, {
                      ...input,
                      grade: input.grade as DesignerGrade,
                      priority: input.priority as DesignerProjectPriority,
                      createdBy: state.currentUser.name
                    }));
                    toast.success('Designer workflow started', {
                      description: 'Bidding, assignment, review, and client approval will run automatically.'
                    });
                  }}
                  onRunAutomation={() => {
                    setState(prev => {
                      const result = advanceDesignerWorkflow(prev);
                      if (result.changed) {
                        toast.success('Automation cycle completed', {
                          description: result.messages[0] || 'Designer workflow moved to the next station.'
                        });
                        return result.state;
                      }
                      toast.info('No designer workflow action is due yet');
                      return prev;
                    });
                  }}
                />
              )}
              {currentView === 'crm' && (
                <CRMView 
                  leads={state.leads.filter(l => 
                    l.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    l.type.toLowerCase().includes(searchQuery.toLowerCase())
                  )} 
                  globalAutoReminder={state.globalAutoReminder}
                  sequences={state.sequences}
                  reminderConfig={state.reminderConfig}
                  reminderTemplates={state.reminderTemplates}
                  users={state.users}
                  onUpdateLead={updateLead} 
                  onUpdateUser={(id, updates) => setState(prev => ({
                    ...prev,
                    users: prev.users.map(u => u.id === id ? { ...u, ...updates } : u)
                  }))}
                  onAddLead={() => setModalType('new_lead')} 
                  onToggleGlobalAutomation={(enabled) => setState(prev => ({ ...prev, globalAutoReminder: enabled }))}
                  onToggleSequence={(id, enabled) => setState(prev => ({
                    ...prev,
                    sequences: prev.sequences.map(s => s.id === id ? { ...s, isActive: enabled } : s)
                  }))}
                  onUpdateReminderConfig={(config) => setState(prev => ({ ...prev, reminderConfig: config }))}
                  onUpdateTemplate={(id, updates) => setState(prev => ({
                    ...prev,
                    reminderTemplates: prev.reminderTemplates.map(t => t.id === id ? { ...t, ...updates } : t)
                  }))}
                  onUpdateSequence={(id, updates) => setState(prev => ({
                    ...prev,
                    sequences: prev.sequences.map(s => s.id === id ? { ...s, ...updates } : s)
                  }))}
                />
              )}
              {currentView === 'hr' && (
                <HRView 
                  vacancies={state.vacancies}
                  candidates={state.candidates}
                  onUpdateVacancy={(id, updates) => {
                    setState(prev => ({
                      ...prev,
                      vacancies: prev.vacancies.map(v => v.id === id ? { ...v, ...updates } : v)
                    }));
                  }}
                  onUpdateCandidate={(id, updates) => {
                    setState(prev => ({
                      ...prev,
                      candidates: prev.candidates.map(c => c.id === id ? { ...c, ...updates } : c)
                    }));
                  }}
                  onAddVacancy={() => {
                    const newVacancy: Vacancy = {
                      id: `VAC-${Math.floor(Math.random() * 1000)}`,
                      jobCode: 'NEW-JOB',
                      title: 'New Position',
                      status: 'open',
                      priority: 'medium',
                      requiredCertifications: [],
                      description: '',
                      created: new Date().toISOString()
                    };
                    setState(prev => ({ ...prev, vacancies: [newVacancy, ...prev.vacancies] }));
                  }}
                  onAddCandidate={(vacancyId) => {
                    const newCandidate: Candidate = {
                      id: `CAN-${Math.floor(Math.random() * 1000)}`,
                      vacancyId: vacancyId || state.vacancies[0]?.id || '',
                      name: 'New Candidate',
                      phone: '',
                      email: '',
                      certifications: '',
                      experienceLevel: 'mid',
                      currentStage: 'applied',
                      skillTestResult: 'Pending',
                      noticePeriod: '30 Days',
                      expectedSalary: 0,
                      appliedDate: new Date().toISOString(),
                      notes: ''
                    };
                    setState(prev => ({ ...prev, candidates: [newCandidate, ...prev.candidates] }));
                  }}
                />
              )}
              {currentView === 'marketing' && (
                <MarketingView 
                  projects={state.marketingProjects}
                  onUpdateProject={(id, updates) => {
                    setState(prev => ({
                      ...prev,
                      marketingProjects: prev.marketingProjects.map(p => p.id === id ? { ...p, ...updates } : p)
                    }));
                  }}
                  onAddProject={() => setModalType('new_marketing_request')}
                />
              )}
              {currentView === 'quotations' && (
                <QuotationsView 
                  quotations={state.quotations.filter(q => q.client.toLowerCase().includes(searchQuery.toLowerCase()) || q.id.toLowerCase().includes(searchQuery.toLowerCase()))} 
                  onSend={sendQuote} 
                  onApprove={approveQuote} 
                  onRevise={reviseQuote} 
                  onCreateProject={createProjectFromQuote} 
                  onDownloadPDF={downloadQuotePDF}
                  onNew={() => setModalType('new_quote')} 
                />
              )}
              {currentView === 'payments' && (
                <PaymentsView 
                  projects={state.projects} 
                  payments={state.payments.filter(p => {
                    const project = state.projects.find(proj => proj.id === p.projectId);
                    const search = searchQuery.toLowerCase();
                    return p.projectId.toLowerCase().includes(search) || 
                           (project && project.client.toLowerCase().includes(search));
                  })} 
                  onMarkReceived={markPaymentReceived} 
                  onSendReminder={(id) => toast.success('Reminder sent to client')} 
                />
              )}
              {currentView === 'projects' && (
                <ProjectsView 
                  projects={state.projects.filter(p => p.client.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()))} 
                  onApproveDesign={approveDesign} 
                  onMarkAdvance={(id) => {
                    const pay = state.payments.find(p => p.projectId === id && p.type === 'advance');
                    if (pay) markPaymentReceived(pay.id);
                  }} 
                  onNew={() => toast.info('New project logic triggered')} 
                  onManage={(id) => setCurrentView('production')} 
                />
              )}
              {currentView === 'production' && (
                <ProductionView 
                  projects={state.projects} 
                  tasks={state.tasks.filter(t => {
                    const project = state.projects.find(p => p.id === t.projectId);
                    const search = searchQuery.toLowerCase();
                    return t.projectId.toLowerCase().includes(search) || 
                           t.title.toLowerCase().includes(search) ||
                           (project && project.client.toLowerCase().includes(search));
                  })} 
                  onUpdateTask={updateTask} 
                  onAddTask={(id) => {
                    setSelectedId(id);
                    setModalType('add_task');
                  }} 
                  onOpenTask={(id) => {
                    const task = state.tasks.find(t => t.id === id);
                    if (task) {
                      const nextProgress = Math.min(100, task.progress + 10);
                      updateTask(id, { progress: nextProgress, status: nextProgress === 100 ? 'done' : 'in_progress' });
                      toast.success(`Task ${id} progress updated to ${nextProgress}%`);
                    }
                  }} 
                />
              )}
              {currentView === 'inventory' && (
                <InventoryView 
                  inventory={state.inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
                  materialRequests={state.materialRequests} 
                  onIssue={(id) => updateInventoryQty(id, -1)} 
                  onRestock={(id) => updateInventoryQty(id, 1)} 
                  onAdd={() => setModalType('add_inventory')} 
                  onNewMR={() => setModalType('new_mr')} 
                  onIssueMR={(id) => {
                    const mr = state.materialRequests.find(m => m.id === id);
                    if (mr) {
                      setState(prev => ({
                        ...prev,
                        materialRequests: prev.materialRequests.map(m => m.id === id ? { ...m, status: 'issued', issuedAt: new Date().toISOString() } : m)
                      }));
                      toast.success('Material issued');
                    }
                  }} 
                  onRaisePO={handleRaisePO} 
                  onWastage={(id, qty) => {
                    setState(prev => reportWastage(id, qty, prev));
                    toast.warning(`Reported ${qty} unit(s) of wastage for item ${id}`);
                  }}
                />
              )}
              {currentView === 'qc' && (
                <QCView 
                  qcChecks={state.qcChecks.filter(q => q.projectId.toLowerCase().includes(searchQuery.toLowerCase()))} 
                  projects={state.projects} 
                  onToggleItem={toggleQCItem} 
                  onSetResult={setQCResult} 
                  onNew={() => setModalType('new_qc')} 
                  onGoToDispatch={() => setCurrentView('dispatch')} 
                />
              )}
              {currentView === 'dispatch' && (
                <DispatchView 
                  projects={state.projects} 
                  dispatches={state.dispatches} 
                  qcChecks={state.qcChecks} 
                  payments={state.payments} 
                  onDispatch={dispatchProject} 
                  onDeliver={deliverProject} 
                  onGoToQC={() => setCurrentView('qc')} 
                  onGoToPayments={() => setCurrentView('payments')} 
                  state={state} 
                />
              )}
              {currentView === 'purchase' && (
                <PurchaseView 
                  suppliers={state.suppliers}
                  purchaseOrders={state.purchaseOrders}
                  inventory={state.inventory}
                  onReceivePO={handleReceivePO}
                  onCreatePO={() => setModalType('new_po')}
                  onCreateSupplier={() => toast.info('Supplier Creation Modal - To be implemented')}
                />
              )}
              {currentView === 'invoices' && (
                <InvoicesView 
                  invoices={state.invoices}
                  onSendInvoice={(id) => {
                    setState(prev => ({
                      ...prev,
                      invoices: prev.invoices.map(inv => inv.id === id ? { ...inv, status: 'sent' } : inv)
                    }));
                    toast.success('Invoice sent to client');
                  }}
                  onMarkPaid={handleMarkInvoicePaid}
                  onDownload={downloadInvoicePDF}
                />
              )}
              {currentView === 'reports' && (
                <ReportsView 
                  projects={state.projects}
                  payments={state.payments}
                  inventory={state.inventory}
                  purchaseOrders={state.purchaseOrders}
                  leads={state.leads}
                />
              )}
              {currentView === 'users' && (
                <UsersView 
                  users={state.users}
                  currentUser={state.currentUser}
                  onAddUser={() => toast.info('User Management - Admin only')}
                  onChangeRole={(id, role) => {
                    setState(prev => ({
                      ...prev,
                      users: prev.users.map(u => u.id === id ? { ...u, role } : u)
                    }));
                    toast.success('User role updated');
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Quick Action Button - Easy to Use */}
      <div className="fixed bottom-8 right-8 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(props) => (
              <Button 
                {...props}
                size="icon" 
                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-500/40 transition-all hover:scale-110 active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </Button>
            )}
          />
          <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 mb-4">
            <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</div>
            <DropdownMenuItem onClick={() => setModalType('new_lead')} className="gap-3 py-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">New Lead</p>
                <p className="text-[10px] text-slate-400">Add to Sales Pipeline</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalType('new_quote')} className="gap-3 py-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Create Quote</p>
                <p className="text-[10px] text-slate-400">Generate Estimate</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModalType('add_inventory')} className="gap-3 py-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Add Inventory</p>
                <p className="text-[10px] text-slate-400">Update Stock Levels</p>
              </div>
            </DropdownMenuItem>
            <Separator className="my-1" />
            <DropdownMenuItem onClick={() => setCurrentView('dashboard')} className="gap-3 py-2.5 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold">Go to Dashboard</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={modalType !== null} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="capitalize">{modalType?.replace('_', ' ')}</DialogTitle>
            <DialogDescription>
              Fill in the details below to proceed.
            </DialogDescription>
          </DialogHeader>
          
          {modalType === 'new_quote' && (
            <QuotationForm 
              leads={state.leads} 
              onSubmit={addQuotation} 
              onCancel={() => setModalType(null)} 
            />
          )}

          {modalType === 'new_lead' && (
            <LeadForm 
              onSubmit={addLead} 
              onCancel={() => setModalType(null)} 
            />
          )}

          {modalType === 'new_marketing_request' && (
            <MarketingRequestForm 
              onSubmit={(data) => {
                const id = `MKT-${Math.floor(Math.random() * 1000)}`;
                const newProject: MarketingProject = {
                  id,
                  created: new Date().toISOString(),
                  ...data as MarketingProject
                };
                setState(prev => ({
                  ...prev,
                  marketingProjects: [newProject, ...prev.marketingProjects]
                }));
                setModalType(null);
                toast.success(`Marketing request ${id} created`);
              }}
              onCancel={() => setModalType(null)}
            />
          )}

          {modalType === 'add_inventory' && (
            <InventoryForm 
              onSubmit={addInventoryItem} 
              onCancel={() => setModalType(null)} 
            />
          )}

          {modalType === 'add_task' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {['Design', 'Fabrication', 'Welding', 'Painting', 'Assembly'].map(type => (
                  <Button 
                    key={type} 
                    variant="outline" 
                    className="justify-start" 
                    onClick={() => {
                      if (selectedId) addTask(selectedId, type as any);
                      setModalType(null);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {modalType === 'new_qc' && (
            <div className="space-y-4 py-4">
              <Label>Select Project for QC</Label>
              <div className="space-y-2">
                {state.projects.filter(p => p.status === 'active').map(p => (
                  <Button 
                    key={p.id} 
                    variant="outline" 
                    className="w-full justify-between" 
                    onClick={() => {
                      addQCCheck(p.id);
                      setModalType(null);
                    }}
                  >
                    <span>{p.id} · {p.client}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {modalType === 'new_mr' && (
            <div className="space-y-4 py-4">
              <Label>Select Project for Material Request</Label>
              <div className="space-y-2">
                {state.projects.filter(p => p.status === 'active').map(p => (
                  <Button 
                    key={p.id} 
                    variant="outline" 
                    className="w-full justify-between" 
                    onClick={() => {
                      addMaterialRequest(p.id);
                      setModalType(null);
                    }}
                  >
                    <span>{p.id} · {p.client}</span>
                    <Plus className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {modalType === 'new_po' && (
            <PurchaseOrderForm 
              suppliers={state.suppliers}
              inventory={state.inventory}
              initialData={(() => {
                if (selectedMRId) {
                  const mr = state.materialRequests.find(m => m.id === selectedMRId);
                  const item = state.inventory.find(i => i.id === mr?.itemId);
                  if (mr && item) {
                    return {
                      items: [{
                        itemId: item.id,
                        name: item.name,
                        qty: mr.qty,
                        rate: item.rate,
                        gst: 18 // Default GST
                      }]
                    };
                  }
                }
                return {};
              })()}
              onSubmit={addPurchaseOrder}
              onCancel={() => {
                setModalType(null);
                setSelectedMRId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
