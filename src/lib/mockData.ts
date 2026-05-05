/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, Quotation, Project, Task, Payment, InventoryItem, MaterialRequest, QCCheck, Dispatch, Supplier, PurchaseOrder, Invoice, UserProfile, DesignerProfile, DesignerProject, DesignerBid, DesignerWorkflowEvent } from '../types';

const now = () => new Date().toISOString();
const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString();
};
const daysFromNow = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString();
};

export const initialLeads: Lead[] = [
  { 
    id: 'L-097', 
    client: 'Patel Construction', 
    phone: '+91 98000-11001', 
    whatsappId: '919800011001',
    type: 'MS Gate + Railing', 
    value: 280000, 
    temp: 'hot', 
    stage: 'new', 
    followup: daysFromNow(1), 
    lastActivity: now(), 
    assignedTo: 'Mayur', 
    createdBy: 'Mayur', 
    created: daysAgo(0),
    autoReminder: true,
    activityLogs: [
      { id: 'AL1', type: 'system', content: 'Lead created from WhatsApp', timestamp: daysAgo(0), performedBy: 'System' },
      { id: 'AL2', type: 'whatsapp', content: 'Sent welcome brochure', timestamp: daysAgo(0), performedBy: 'System' }
    ]
  },
  { 
    id: 'L-096', 
    client: 'Sharma Developers', 
    phone: '+91 98000-11002', 
    whatsappId: '919800011002',
    type: 'SS Canopy', 
    value: 410000, 
    temp: 'warm', 
    stage: 'new', 
    followup: daysFromNow(1), 
    lastActivity: now(), 
    assignedTo: 'Mayur', 
    createdBy: 'Mayur', 
    created: daysAgo(0),
    autoReminder: true,
    activityLogs: [
      { id: 'AL3', type: 'system', content: 'Lead created from Facebook Ads', timestamp: daysAgo(0), performedBy: 'System' }
    ]
  },
  { 
    id: 'L-094', 
    client: 'Mehta Infra', 
    phone: '+91 98000-11003', 
    type: 'Staircase fabrication', 
    value: 650000, 
    temp: 'hot', 
    stage: 'new', 
    followup: daysAgo(1), 
    lastActivity: daysAgo(2), 
    assignedTo: 'Mayur', 
    createdBy: 'Mayur', 
    created: daysAgo(2),
    autoReminder: true,
    activityLogs: [
      { 
        id: 'AL-AUTO-MEHTA', 
        type: 'system', 
        content: 'Auto WhatsApp reminder sent for overdue follow-up (Scheduled: ' + daysAgo(1).split('T')[0] + ')', 
        timestamp: now(), 
        performedBy: 'System Automation' 
      }
    ]
  },
  { 
    id: 'L-092', 
    client: 'Sunrise Builders', 
    phone: '+91 98000-11004', 
    type: 'Pergola + canopy', 
    value: 820000, 
    temp: 'hot', 
    stage: 'requirement_collected', 
    followup: daysFromNow(0), 
    lastActivity: daysAgo(1), 
    assignedTo: 'Mayur', 
    createdBy: 'Mayur', 
    created: daysAgo(3),
    autoReminder: true,
    activityLogs: [
      { id: 'AL4', type: 'call', content: 'Requirement discussion over phone', timestamp: daysAgo(1), performedBy: 'Mayur' }
    ]
  },
  { 
    id: 'L-090', 
    client: 'Galaxy Realty', 
    phone: '+91 98000-11005', 
    type: 'MS window grills x40', 
    value: 190000, 
    temp: 'warm', 
    stage: 'quote_sent', 
    followup: daysFromNow(3), 
    lastActivity: now(), 
    assignedTo: 'Mayur', 
    createdBy: 'Mayur', 
    created: daysAgo(5),
    autoReminder: true,
    activityLogs: [
      { id: 'AL-GALAXY-QUOTE', type: 'system', content: 'Stage changed to quote_sent', timestamp: now(), performedBy: 'Mayur' },
      { id: 'AL-GALAXY-WA-FOLLOWUP', type: 'whatsapp', content: 'WhatsApp follow-up sent regarding the quote for MS window grills x40', timestamp: now(), performedBy: 'Mayur' }
    ]
  },
  { 
    id: 'L-089', 
    client: 'Diamond Constructions', 
    phone: '+91 98000-11006', 
    type: 'Industrial rack system', 
    value: 1200000, 
    temp: 'hot', 
    stage: 'requirement_collected', 
    followup: daysAgo(1), 
    lastActivity: daysAgo(3), 
    assignedTo: 'Mayur', 
    createdBy: 'Mayur', 
    created: daysAgo(5),
    autoReminder: true,
    activityLogs: []
  },
];

export const initialQuotations: Quotation[] = [
  { id: 'Q-112', leadId: 'L-092', client: 'Sunrise Builders', type: 'SS partition', version: 1, material: 180000, labour: 90000, margin: 22, status: 'sent', sentAt: daysAgo(3), followupDue: daysAgo(0), created: daysAgo(3) },
  { id: 'Q-111', leadId: '', client: 'Reliance Township', type: 'Bulk gates', version: 2, material: 1020000, labour: 450000, margin: 25, status: 'sent', sentAt: daysAgo(1), followupDue: daysFromNow(2), created: daysAgo(5) },
  { id: 'Q-110', leadId: '', client: 'Agarwal Villa', type: 'SS Railing', version: 1, material: 250000, labour: 110000, margin: 20, status: 'approved', sentAt: daysAgo(5), followupDue: daysAgo(2), created: daysAgo(7) },
  { id: 'Q-109', leadId: '', client: 'City Apartments', type: 'Staircase railing x8', version: 2, material: 290000, labour: 130000, margin: 19, status: 'revised', sentAt: daysAgo(5), followupDue: daysAgo(2), created: daysAgo(9) },
  { id: 'Q-108', leadId: '', client: 'Tech Park B', type: 'MS Staircase', version: 1, material: 510000, labour: 220000, margin: 22, status: 'approved', sentAt: daysAgo(7), followupDue: daysAgo(4), created: daysAgo(10) },
];

export const initialProjects: Project[] = [
  { id: 'PRJ-041', code: 'PRJ-041', quoteId: 'Q-110', leadId: '', client: 'Agarwal Villa', type: 'SS Railing', value: 460000, status: 'active', advanceReceived: true, designApproved: true, deadline: daysFromNow(7), progress: 78, designer: 'Rahul S.', created: daysAgo(10) },
  { id: 'PRJ-040', code: 'PRJ-040', quoteId: 'Q-109', leadId: '', client: 'Mehta Bungalow', type: 'MS Gate', value: 320000, status: 'active', advanceReceived: true, designApproved: true, deadline: daysFromNow(14), progress: 55, designer: 'Kiran M.', created: daysAgo(8) },
  { id: 'PRJ-039', code: 'PRJ-039', quoteId: 'Q-112', leadId: '', client: 'Sunrise Plaza', type: 'Canopy', value: 340000, status: 'active', advanceReceived: false, designApproved: true, deadline: daysAgo(2), progress: 32, designer: 'Kiran M.', created: daysAgo(12) },
  { id: 'PRJ-038', code: 'PRJ-038', quoteId: 'Q-108', leadId: '', client: 'Tech Park B', type: 'Staircase', value: 910000, status: 'active', advanceReceived: true, designApproved: true, deadline: daysFromNow(3), progress: 91, designer: 'Rahul S.', created: daysAgo(20) },
  { id: 'PRJ-037', code: 'PRJ-037', quoteId: 'Q-111', leadId: '', client: 'Hotel Grand', type: 'MS Frame', value: 770000, status: 'active', advanceReceived: true, designApproved: false, deadline: daysFromNow(21), progress: 15, designer: 'Rahul S.', created: daysAgo(5) },
];

export const initialTasks: Task[] = [
  { id: 'T-001', projectId: 'PRJ-041', type: 'cutting', title: 'Pipe cutting set', assignee: 'Ramesh K.', status: 'done', progress: 100, due: daysAgo(5), machine: 'Cutting machine 1' },
  { id: 'T-002', projectId: 'PRJ-041', type: 'welding', title: 'Frame assembly', assignee: 'Suresh V.', status: 'in_progress', progress: 70, due: daysFromNow(2), machine: 'Welding set A' },
  { id: 'T-003', projectId: 'PRJ-041', type: 'finishing', title: 'Polish + buffing', assignee: 'Dinesh P.', status: 'pending', progress: 0, due: daysFromNow(5), machine: 'Grinder' },
  { id: 'T-004', projectId: 'PRJ-038', type: 'welding', title: 'Full assembly', assignee: 'Ramesh K.', status: 'done', progress: 100, due: daysAgo(2), machine: 'Welding set B' },
  { id: 'T-005', projectId: 'PRJ-038', type: 'finishing', title: 'Finishing coat', assignee: 'Mahesh T.', status: 'done', progress: 100, due: daysAgo(1), machine: 'Spray booth' },
  { id: 'T-006', projectId: 'PRJ-039', type: 'cutting', title: 'Section cutting', assignee: 'Mahesh T.', status: 'blocked', progress: 0, due: daysAgo(3), machine: 'Cutting machine 2', blockerReason: 'Advance payment not received' },
  { id: 'T-007', projectId: 'PRJ-040', type: 'welding', title: 'Gate frame weld', assignee: 'Suresh V.', status: 'in_progress', progress: 55, due: daysFromNow(5), machine: 'Welding set A' },
];

export const initialPayments: Payment[] = [
  { id: 'PAY-001', projectId: 'PRJ-041', type: 'advance', amount: 230000, status: 'received', due: daysAgo(10), receivedAt: daysAgo(9), reminders: 0 },
  { id: 'PAY-002', projectId: 'PRJ-041', type: 'final', amount: 230000, status: 'pending', due: daysFromNow(7), receivedAt: null, reminders: 0 },
  { id: 'PAY-003', projectId: 'PRJ-038', type: 'advance', amount: 455000, status: 'received', due: daysAgo(20), receivedAt: daysAgo(19), reminders: 0 },
  { id: 'PAY-004', projectId: 'PRJ-038', type: 'final', amount: 455000, status: 'pending', due: daysFromNow(3), receivedAt: null, reminders: 0 },
  { id: 'PAY-005', projectId: 'PRJ-039', type: 'advance', amount: 170000, status: 'overdue', due: daysAgo(6), receivedAt: null, reminders: 2 },
  { id: 'PAY-006', projectId: 'PRJ-040', type: 'advance', amount: 160000, status: 'received', due: daysAgo(8), receivedAt: daysAgo(7), reminders: 0 },
  { id: 'PAY-007', projectId: 'PRJ-037', type: 'advance', amount: 385000, status: 'received', due: daysAgo(4), receivedAt: daysAgo(3), reminders: 0 },
];

export const initialInventory: InventoryItem[] = [
  { id: 'RM-001', name: 'SS pipe 2" OD', category: 'raw_material', unit: 'mtr', qty: 340, threshold: 100, rate: 850 },
  { id: 'RM-002', name: 'MS hollow 40x40x3mm', category: 'raw_material', unit: 'mtr', qty: 180, threshold: 80, rate: 620 },
  { id: 'RM-003', name: 'MS flat 50x6mm', category: 'raw_material', unit: 'mtr', qty: 42, threshold: 60, rate: 480 },
  { id: 'RM-004', name: 'SS sheet 1.2mm', category: 'raw_material', unit: 'sheet', qty: 18, threshold: 25, rate: 3200 },
  { id: 'RM-005', name: 'MS pipe 1.5" OD', category: 'raw_material', unit: 'mtr', qty: 0, threshold: 50, rate: 520 },
  { id: 'CN-001', name: 'Welding electrodes 3.15mm', category: 'consumable', unit: 'box', qty: 12, threshold: 5, rate: 380 },
  { id: 'CN-002', name: 'Cutting disc 4"', category: 'consumable', unit: 'pcs', qty: 34, threshold: 20, rate: 45 },
  { id: 'CN-003', name: 'Grinding paste', category: 'consumable', unit: 'kg', qty: 3, threshold: 5, rate: 240 },
  { id: 'CN-004', name: 'Primer spray paint', category: 'consumable', unit: 'can', qty: 0, threshold: 10, rate: 180 },
  { id: 'TL-001', name: 'Angle grinder 4.5"', category: 'tool', unit: 'pcs', qty: 4, threshold: 2, rate: 3800 },
];

export const initialMaterialRequests: MaterialRequest[] = [
  { id: 'MRQ-021', taskId: 'T-001', projectId: 'PRJ-041', itemId: 'RM-001', qty: 120, status: 'issued', requestedBy: 'Ramesh K.', issuedAt: daysAgo(5), created: daysAgo(5) },
  { id: 'MRQ-020', taskId: 'T-004', projectId: 'PRJ-038', itemId: 'CN-001', qty: 3, status: 'issued', requestedBy: 'Suresh V.', issuedAt: daysAgo(2), created: daysAgo(2) },
  { id: 'MRQ-019', taskId: 'T-006', projectId: 'PRJ-039', itemId: 'RM-005', qty: 80, status: 'purchase_raised', requestedBy: 'Mahesh T.', issuedAt: null, created: daysAgo(1) },
  { id: 'MRQ-018', taskId: 'T-007', projectId: 'PRJ-040', itemId: 'RM-002', qty: 60, status: 'pending', requestedBy: 'Dinesh P.', issuedAt: null, created: daysAgo(0) },
];

export const initialQCChecks: QCCheck[] = [
  {
    id: 'QC-001', projectId: 'PRJ-038', taskId: 'T-005', checkedBy: 'Arvind', result: 'rework',
    items: [
      { label: 'Weld joints — no cracks or porosity', passed: true },
      { label: 'Dimensional accuracy ±2mm', passed: true },
      { label: 'Surface finish — no sharp edges', passed: true },
      { label: 'Paint / primer coating uniform', passed: false, note: 'Bare patch found' },
      { label: 'Load test / structural check', passed: true },
      { label: 'Client drawing match', passed: null },
    ],
    reworkNotes: 'Primer patch on south face needs recoat', checkedAt: daysAgo(0)
  },
  {
    id: 'QC-002', projectId: 'PRJ-041', taskId: 'T-003', checkedBy: 'Arvind', result: 'pending',
    items: [
      { label: 'Weld joints — no cracks or porosity', passed: null },
      { label: 'Dimensional accuracy ±2mm', passed: null },
      { label: 'Surface finish — no sharp edges', passed: null },
      { label: 'Paint / primer coating uniform', passed: null },
      { label: 'Load test / structural check', passed: null },
      { label: 'Client drawing match', passed: null },
    ],
    reworkNotes: '', checkedAt: null
  },
];

export const initialDispatches: Dispatch[] = [
  { id: 'DSP-001', projectId: 'PRJ-038', qcId: 'QC-001', paymentCleared: false, status: 'blocked', vehicle: 'GJ-05-XX-1234', address: 'Tech Park B, Surat', dispatched: null, deliveredAt: null },
];

export const initialSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'Jindal Steel & Power', contactPerson: 'Amit Jindal', phone: '+91 99000-22001', email: 'amit@jindal.com', gstin: '24AAAAA0000A1Z5', address: 'Hisar, Haryana', category: ['raw_material'] },
  { id: 'SUP-002', name: 'Tata Steel Ltd', contactPerson: 'Rohan Tata', phone: '+91 99000-22002', email: 'rohan@tata.com', gstin: '24BBBBB0000B1Z5', address: 'Jamshedpur, Jharkhand', category: ['raw_material'] },
  { id: 'SUP-003', name: 'Industrial Tools Corp', contactPerson: 'Sanjay Jain', phone: '+91 99000-22003', email: 'sanjay@itc.com', gstin: '24CCCCC0000C1Z5', address: 'Ahmedabad, Gujarat', category: ['tool', 'consumable'] },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO-001', supplierId: 'SUP-001', items: [{ itemId: 'RM-001', name: 'SS pipe 2" OD', qty: 100, rate: 850, gst: 18 }], totalAmount: 100300, status: 'received', expectedDelivery: daysAgo(2), receivedAt: daysAgo(1), created: daysAgo(5) },
  { id: 'PO-002', supplierId: 'SUP-003', items: [{ itemId: 'CN-002', name: 'Cutting disc 4"', qty: 50, rate: 45, gst: 18 }], totalAmount: 2655, status: 'sent', expectedDelivery: daysFromNow(3), receivedAt: null, created: daysAgo(1) },
];

export const initialInvoices: Invoice[] = [
  { id: 'INV-001', projectId: 'PRJ-038', client: 'Tech Park B', items: [{ description: 'MS Staircase Fabrication', qty: 1, rate: 745900, gst: 18 }], subTotal: 745900, gstTotal: 134262, totalAmount: 880162, status: 'sent', dueDate: daysFromNow(15), created: daysAgo(2) },
];

export const initialDesigners: DesignerProfile[] = [
  {
    id: 'DES-001',
    name: 'Rahul S.',
    grades: ['A', 'B', 'C'],
    active: true,
    workload: 1,
    rating: 4.8,
    onTimeRate: 94,
    firstApprovalRate: 88,
    avgCompletionHours: 11,
    totalProjects: 42,
    totalRevisions: 9,
    gradeWiseCompleted: { A: 16, B: 18, C: 8 }
  },
  {
    id: 'DES-002',
    name: 'Kiran M.',
    grades: ['B', 'C'],
    active: true,
    workload: 2,
    rating: 4.5,
    onTimeRate: 89,
    firstApprovalRate: 82,
    avgCompletionHours: 9,
    totalProjects: 35,
    totalRevisions: 11,
    gradeWiseCompleted: { A: 0, B: 20, C: 15 }
  },
  {
    id: 'DES-003',
    name: 'Nisha P.',
    grades: ['A', 'B'],
    active: true,
    workload: 0,
    rating: 4.9,
    onTimeRate: 97,
    firstApprovalRate: 91,
    avgCompletionHours: 13,
    totalProjects: 51,
    totalRevisions: 7,
    gradeWiseCompleted: { A: 28, B: 23, C: 0 }
  },
  {
    id: 'DES-004',
    name: 'Amit D.',
    grades: ['C'],
    active: true,
    workload: 1,
    rating: 4.1,
    onTimeRate: 84,
    firstApprovalRate: 76,
    avgCompletionHours: 7,
    totalProjects: 24,
    totalRevisions: 12,
    gradeWiseCompleted: { A: 0, B: 0, C: 24 }
  }
];

export const initialDesignerProjects: DesignerProject[] = [
  {
    id: 'DP-101',
    name: 'SS Railing Shop Drawing',
    client: 'Agarwal Villa',
    description: 'Prepare client-ready railing drawing with dimensions and finish notes.',
    grade: 'A',
    priority: 'high',
    estimatedHours: 14,
    status: 'client_review',
    assignedDesignerId: 'DES-003',
    selectedBidId: 'DB-900',
    revisionCount: 0,
    autoReviewPassed: true,
    clientAutoApprovalAt: daysFromNow(1),
    createdBy: 'Sales Automation',
    created: daysAgo(1),
    updatedAt: now(),
    dueAt: daysFromNow(1),
    completedAt: null
  },
  {
    id: 'DP-100',
    name: 'Canopy Concept Layout',
    client: 'Sunrise Builders',
    description: 'Concept layout for front canopy with visual reference and fabrication notes.',
    grade: 'B',
    priority: 'medium',
    estimatedHours: 10,
    status: 'completed',
    assignedDesignerId: 'DES-002',
    selectedBidId: 'DB-899',
    revisionCount: 1,
    autoReviewPassed: true,
    clientAutoApprovalAt: null,
    createdBy: 'Sales Automation',
    created: daysAgo(4),
    updatedAt: daysAgo(2),
    dueAt: daysAgo(2),
    completedAt: daysAgo(2)
  }
];

export const initialDesignerBids: DesignerBid[] = [
  { id: 'DB-900', projectId: 'DP-101', designerId: 'DES-003', bidHours: 12, score: 19.1, status: 'selected', created: daysAgo(1) },
  { id: 'DB-899', projectId: 'DP-100', designerId: 'DES-002', bidHours: 9, score: 22.3, status: 'selected', created: daysAgo(4) }
];

export const initialDesignerWorkflowEvents: DesignerWorkflowEvent[] = [
  { id: 'DWE-001', projectId: 'DP-101', label: 'Client review timer running', detail: 'No client response will auto-approve at the configured deadline.', created: now() },
  { id: 'DWE-002', projectId: 'DP-100', label: 'Project completed', detail: 'Client auto-approved after revision and performance metrics were updated.', created: daysAgo(2) }
];

export const initialUsers: UserProfile[] = [
  { id: 'U-001', name: 'Mayur', email: 'mayur@faberp.com', role: 'admin', department: 'Management', status: 'active', currentLeadCount: 0 },
  { id: 'U-002', name: 'Rahul S.', email: 'rahul@faberp.com', role: 'manager', department: 'Design', status: 'active', currentLeadCount: 12 },
  { id: 'U-003', name: 'Ramesh K.', email: 'ramesh@faberp.com', role: 'operator', department: 'Production', status: 'active', currentLeadCount: 0 },
  { id: 'U-004', name: 'Amit V.', email: 'amit@faberp.com', role: 'manager', department: 'Sales', status: 'active', currentLeadCount: 5 },
  { id: 'U-005', name: 'Sanjay P.', email: 'sanjay@faberp.com', role: 'manager', department: 'Sales', status: 'inactive', currentLeadCount: 8 },
];
