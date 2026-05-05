/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lead, Quotation, Project, Task, Payment, InventoryItem, MaterialRequest, QCCheck, Dispatch, TaskType, Supplier, PurchaseOrder, Invoice, UserProfile, WASequence, LeadSequenceStatus, ReminderTemplate, ReminderConfig, Vacancy, Candidate, MarketingProject, DesignerProfile, DesignerProject, DesignerBid, DesignerWorkflowEvent, DesignerProjectPriority, DesignerGrade } from '../types';
import { initialLeads, initialQuotations, initialProjects, initialTasks, initialPayments, initialInventory, initialMaterialRequests, initialQCChecks, initialDispatches, initialSuppliers, initialPurchaseOrders, initialInvoices, initialUsers, initialDesigners, initialDesignerProjects, initialDesignerBids, initialDesignerWorkflowEvents } from './mockData';

export interface AppState {
  leads: Lead[];
  quotations: Quotation[];
  projects: Project[];
  tasks: Task[];
  payments: Payment[];
  inventory: InventoryItem[];
  materialRequests: MaterialRequest[];
  qcChecks: QCCheck[];
  dispatches: Dispatch[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  users: UserProfile[];
  currentUser: UserProfile;
  globalAutoReminder: boolean;
  sequences: WASequence[];
  leadSequenceStatuses: LeadSequenceStatus[];
  vacancies: Vacancy[];
  candidates: Candidate[];
  marketingProjects: MarketingProject[];
  designers: DesignerProfile[];
  designerProjects: DesignerProject[];
  designerBids: DesignerBid[];
  designerWorkflowEvents: DesignerWorkflowEvent[];
  reminderConfig: ReminderConfig;
  reminderTemplates: ReminderTemplate[];
  nextIds: {
    lead: number;
    quote: number;
    project: number;
    task: number;
    payment: number;
    mrq: number;
    qc: number;
    dsp: number;
    sup: number;
    po: number;
    inv: number;
    designerProject: number;
    designerBid: number;
    designerEvent: number;
  };
}

const STORE_KEY = 'fab_erp_v1';

export const loadState = (): AppState => {
  const defaults: AppState = {
    leads: initialLeads,
    quotations: initialQuotations,
    projects: initialProjects,
    tasks: initialTasks,
    payments: initialPayments,
    inventory: initialInventory,
    materialRequests: initialMaterialRequests,
    qcChecks: initialQCChecks,
    dispatches: initialDispatches,
    suppliers: initialSuppliers,
    purchaseOrders: initialPurchaseOrders,
    invoices: initialInvoices,
    users: initialUsers,
    currentUser: initialUsers[0],
    globalAutoReminder: true,
    sequences: [
      {
        id: 'SEQ-001',
        name: 'New Lead Nurturing',
        isActive: true,
        steps: [
          { id: 'S1', delayDays: 0, templateName: 'welcome', content: 'Welcome to Offside Machine Shops! We received your inquiry.' },
          { id: 'S2', delayDays: 2, templateName: 'brochure_followup', content: 'Hi! Did you get a chance to look at our fabrication brochure?' },
          { id: 'S3', delayDays: 5, templateName: 'portfolio', content: 'Check out some of our recent industrial projects here: [link]' }
        ]
      }
    ],
    leadSequenceStatuses: [],
    designers: initialDesigners,
    designerProjects: initialDesignerProjects,
    designerBids: initialDesignerBids,
    designerWorkflowEvents: initialDesignerWorkflowEvents,
    vacancies: [
      {
        id: 'VAC-001',
        jobCode: 'WLD-MIG-01',
        title: 'MIG Welder',
        status: 'interviewing',
        priority: 'high',
        requiredCertifications: ['X-Ray Quality', 'ASME Section IX'],
        description: 'Need experienced MIG welder for heavy structural fabrication.',
        created: '2024-03-15T10:00:00Z'
      },
      {
        id: 'VAC-002',
        jobCode: 'FIT-FAB-02',
        title: 'Fabrication Fitter',
        status: 'open',
        priority: 'medium',
        requiredCertifications: ['Blueprint Reading', 'ITI Fitter'],
        description: 'Fitter for assembly of industrial machine frames.',
        created: '2024-03-20T14:30:00Z'
      },
      {
        id: 'VAC-003',
        jobCode: 'QC-ENG-03',
        title: 'QC Engineer',
        status: 'on_hold',
        priority: 'low',
        requiredCertifications: ['NDT Level II', 'ISO 9001'],
        description: 'Quality control for final inspection of fabricated parts.',
        created: '2024-03-25T09:15:00Z'
      }
    ],
    candidates: [
      {
        id: 'CAN-001',
        vacancyId: 'VAC-001',
        name: 'Rajesh K.',
        phone: '+91 98765 43210',
        email: 'rajesh.k@example.com',
        certifications: 'X-Ray Quality Passed, MIG/TIG Certified',
        experienceLevel: 'senior',
        currentStage: 'offered',
        skillTestResult: 'X-Ray Quality Passed - Excellent penetration',
        noticePeriod: '15 Days',
        expectedSalary: 35000,
        appliedDate: '2024-03-16T11:00:00Z',
        notes: 'Very strong technical skills. Ready to join.'
      },
      {
        id: 'CAN-002',
        vacancyId: 'VAC-002',
        name: 'Amit S.',
        phone: '+91 98765 43211',
        email: 'amit.s@example.com',
        certifications: 'ITI Fitter, Blueprint Reading',
        experienceLevel: 'mid',
        currentStage: 'interviewed',
        skillTestResult: 'Blueprint Reading - 90% accuracy',
        noticePeriod: '30 Days',
        expectedSalary: 28000,
        appliedDate: '2024-03-21T10:00:00Z',
        notes: 'Good understanding of complex drawings.'
      },
      {
        id: 'CAN-003',
        vacancyId: 'VAC-003',
        name: 'Suresh P.',
        phone: '+91 98765 43212',
        email: 'suresh.p@example.com',
        certifications: 'NDT Level II, CSWIP 3.1',
        experienceLevel: 'senior',
        currentStage: 'applied',
        skillTestResult: 'Pending',
        noticePeriod: 'Immediate',
        expectedSalary: 45000,
        appliedDate: '2024-03-26T15:00:00Z',
        notes: 'Waiting for project start to proceed.'
      }
    ],
    marketingProjects: [
      {
        id: 'MKT-001',
        name: 'New Bridge Fabrication',
        location: 'Workshop Bay 2',
        highlights: 'MIG Welding, Heavy Lifting, Final Finish',
        assignedTo: 'Rahul (Video)',
        type: 'video',
        shootDate: '2024-04-15T09:00:00Z',
        status: 'in_progress',
        deadline: '2024-04-22T18:00:00Z',
        channels: ['LinkedIn', 'Website'],
        primaryGoal: 'portfolio',
        requiredFormat: 'horizontal',
        onSiteContact: 'Suresh V.',
        safetyLevel: 'high_risk',
        safetyCheck: true,
        rawFootageSaved: false,
        equipmentCheck: true,
        created: '2024-04-10T10:00:00Z'
      },
      {
        id: 'MKT-002',
        name: 'Workshop Safety Film',
        location: 'Main Floor',
        highlights: 'PPE Compliance, Safe Handling',
        assignedTo: 'Amit (Photo)',
        type: 'photo',
        shootDate: '2024-04-18T10:00:00Z',
        status: 'not_started',
        deadline: '2024-04-25T18:00:00Z',
        channels: ['Internal Training'],
        primaryGoal: 'safety',
        requiredFormat: 'horizontal',
        onSiteContact: 'Ramesh K.',
        safetyLevel: 'standard',
        safetyCheck: true,
        rawFootageSaved: false,
        equipmentCheck: true,
        created: '2024-04-12T14:30:00Z'
      },
      {
        id: 'MKT-003',
        name: 'Laser Cutting Demo',
        location: 'Laser Bay',
        highlights: 'High-speed cutting, Precision edges',
        assignedTo: 'Rahul (Video)',
        type: 'video',
        shootDate: '2024-04-20T11:00:00Z',
        status: 'planning',
        deadline: '2024-04-30T18:00:00Z',
        channels: ['Instagram', 'YouTube'],
        primaryGoal: 'social',
        requiredFormat: 'vertical',
        onSiteContact: 'Mahesh T.',
        safetyLevel: 'standard',
        safetyCheck: false,
        rawFootageSaved: false,
        equipmentCheck: true,
        created: '2024-04-14T09:15:00Z'
      }
    ],
    reminderConfig: {
      intervalDays: 1,
      templateId: 'T1'
    },
    reminderTemplates: [
      { id: 'T1', name: 'Standard Follow-up', content: 'Hi! Just checking in regarding our previous discussion. Do you have any updates?' },
      { id: 'T2', name: 'Urgent Reminder', content: 'Hello, we noticed your follow-up is overdue. Please let us know if you would like to proceed.' }
    ],
    nextIds: { lead: 98, quote: 113, project: 42, task: 8, payment: 8, mrq: 22, qc: 3, dsp: 2, sup: 4, po: 3, inv: 2, designerProject: 102, designerBid: 901, designerEvent: 3 },
  };

  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const loaded = JSON.parse(raw);
      // Merge with defaults to handle schema updates
      return {
        ...defaults,
        ...loaded,
        nextIds: { ...defaults.nextIds, ...(loaded.nextIds || {}) }
      };
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return defaults;
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
};

// --- Integration Logic ---

export const processMaterialIssue = (mrId: string, state: AppState): AppState => {
  const mr = state.materialRequests.find(m => m.id === mrId);
  if (!mr || mr.status !== 'pending') return state;

  const item = state.inventory.find(i => i.id === mr.itemId);
  if (!item || item.qty < mr.qty) return state;

  return {
    ...state,
    inventory: state.inventory.map(i => 
      i.id === mr.itemId ? { ...i, qty: i.qty - mr.qty } : i
    ),
    materialRequests: state.materialRequests.map(m => 
      m.id === mrId ? { ...m, status: 'issued', issuedAt: new Date().toISOString() } : m
    )
  };
};

export const receivePO = (poId: string, state: AppState): AppState => {
  const po = state.purchaseOrders.find(p => p.id === poId);
  if (!po || po.status !== 'sent') return state;

  const newInventory = [...state.inventory];
  po.items.forEach(poItem => {
    const invItemIdx = newInventory.findIndex(i => i.id === poItem.itemId);
    if (invItemIdx > -1) {
      newInventory[invItemIdx] = {
        ...newInventory[invItemIdx],
        qty: newInventory[invItemIdx].qty + poItem.qty
      };
    }
  });

  return {
    ...state,
    inventory: newInventory,
    purchaseOrders: state.purchaseOrders.map(p => 
      p.id === poId ? { ...p, status: 'received', receivedAt: new Date().toISOString() } : p
    )
  };
};

export const generateInvoiceFromProject = (projectId: string, state: AppState): AppState => {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return state;

  const id = `INV-${state.nextIds.inv}`;
  const subTotal = project.value;
  const gstTotal = Math.round(subTotal * 0.18);
  const totalAmount = subTotal + gstTotal;

  const newInvoice: Invoice = {
    id,
    projectId,
    client: project.client,
    items: [{ description: `${project.type} Fabrication Work`, qty: 1, rate: subTotal, gst: 18 }],
    subTotal,
    gstTotal,
    totalAmount,
    status: 'draft',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    created: new Date().toISOString()
  };

  return {
    ...state,
    invoices: [...state.invoices, newInvoice],
    nextIds: { ...state.nextIds, inv: state.nextIds.inv + 1 }
  };
};

export const reportWastage = (itemId: string, qty: number, state: AppState): AppState => {
  return {
    ...state,
    inventory: state.inventory.map(i => 
      i.id === itemId ? { ...i, qty: Math.max(0, i.qty - qty) } : i
    )
  };
};

// Rules Engine Functions
export const checkGates = (projectId: string, state: AppState) => {
  const p = state.projects.find(x => x.id === projectId);
  if (!p) return { ok: false, reason: 'Project not found' };
  if (!p.advanceReceived) return { ok: false, reason: 'Advance payment not received' };
  if (!p.designApproved) return { ok: false, reason: 'Design not approved' };
  return { ok: true };
};

export const canDispatch = (projectId: string, state: AppState) => {
  const p = state.projects.find(x => x.id === projectId);
  if (!p) return { ok: false, reason: 'Project not found' };
  const pays = state.payments.filter(x => x.projectId === projectId);
  const allPaid = pays.every(x => x.status === 'received');
  if (!allPaid) return { ok: false, reason: 'Payment not fully cleared' };
  const qc = state.qcChecks.find(x => x.projectId === projectId && x.result === 'pass');
  if (!qc) return { ok: false, reason: 'QC not passed' };
  return { ok: true };
};

export const stockCheck = (itemId: string, qty: number, state: AppState) => {
  const item = state.inventory.find(x => x.id === itemId);
  if (!item) return { ok: false, reason: 'Item not found' };
  if (item.qty < qty) return { ok: false, reason: `Only ${item.qty} ${item.unit} in stock`, purchase: true };
  return { ok: true, item };
};

// --- System Brain Automation Triggers ---

export const autoCreateTasks = (projectId: string, state: AppState): Task[] => {
  const tasks: TaskType[] = ['procurement', 'cutting', 'welding', 'finishing', 'qc'];
  return tasks.map((type, i) => ({
    id: `T-${state.nextIds.task + i}`,
    projectId,
    type,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${projectId}`,
    assignee: 'Floor Team A',
    status: 'pending',
    progress: 0,
    due: new Date(Date.now() + (i + 1) * 86400000 * 2).toISOString(),
  }));
};

export const autoCreateProject = (quoteId: string, state: AppState): { project: Project, payments: Payment[] } => {
  const q = state.quotations.find(x => x.id === quoteId);
  if (!q) throw new Error('Quote not found');
  
  const id = `PRJ-${state.nextIds.project}`;
  const total = Math.round((q.material + q.labour) / (1 - q.margin / 100));
  
  const project: Project = {
    id,
    code: id,
    quoteId,
    leadId: q.leadId,
    client: q.client,
    type: q.type,
    value: total,
    status: 'active',
    advanceReceived: true, // Triggered by payment
    designApproved: false,
    deadline: new Date(Date.now() + 2592000000).toISOString(),
    progress: 0,
    designer: 'Rahul S.',
    created: new Date().toISOString(),
  };

  const finalPayment: Payment = {
    id: `PAY-${state.nextIds.payment}`,
    projectId: id,
    type: 'final',
    amount: Math.round(total * 0.5),
    status: 'pending',
    due: new Date(Date.now() + 2592000000).toISOString(),
    receivedAt: null,
    reminders: 0,
  };

  return { project, payments: [finalPayment] };
};

const priorityHours: Record<DesignerProjectPriority, number> = {
  low: 96,
  medium: 72,
  high: 48,
  urgent: 24
};

const event = (state: AppState, projectId: string, label: string, detail: string): DesignerWorkflowEvent => ({
  id: `DWE-${state.nextIds.designerEvent}`,
  projectId,
  label,
  detail,
  created: new Date().toISOString()
});

const scoreDesignerBid = (designer: DesignerProfile, bidHours: number) => {
  const workloadPenalty = designer.workload * 4;
  const speedScore = bidHours;
  const qualityBonus = (designer.rating - 4) * 3;
  const onTimeBonus = designer.onTimeRate / 20;
  const firstApprovalBonus = designer.firstApprovalRate / 25;
  return Number((speedScore + workloadPenalty - qualityBonus - onTimeBonus - firstApprovalBonus).toFixed(1));
};

export const createDesignerProject = (
  state: AppState,
  input: {
    name: string;
    client: string;
    description: string;
    grade: DesignerGrade;
    priority: DesignerProjectPriority;
    estimatedHours: number;
    createdBy?: string;
  }
): AppState => {
  const now = new Date();
  const id = `DP-${state.nextIds.designerProject}`;
  const due = new Date(now.getTime() + priorityHours[input.priority] * 60 * 60 * 1000);
  const project: DesignerProject = {
    id,
    name: input.name,
    client: input.client,
    description: input.description,
    grade: input.grade,
    priority: input.priority,
    estimatedHours: input.estimatedHours,
    status: 'created',
    assignedDesignerId: null,
    selectedBidId: null,
    revisionCount: 0,
    autoReviewPassed: false,
    clientAutoApprovalAt: null,
    createdBy: input.createdBy || 'Sales Automation',
    created: now.toISOString(),
    updatedAt: now.toISOString(),
    dueAt: due.toISOString(),
    completedAt: null
  };
  const createdEvent = event(state, id, 'Project created', `${input.grade}-grade work entered by ${project.createdBy}.`);

  return {
    ...state,
    designerProjects: [project, ...state.designerProjects],
    designerWorkflowEvents: [createdEvent, ...state.designerWorkflowEvents],
    nextIds: {
      ...state.nextIds,
      designerProject: state.nextIds.designerProject + 1,
      designerEvent: state.nextIds.designerEvent + 1
    }
  };
};

export const advanceDesignerWorkflow = (state: AppState): { state: AppState; changed: boolean; messages: string[] } => {
  let next = { ...state };
  let changed = false;
  const messages: string[] = [];
  const now = new Date();
  let nextBidId = next.nextIds.designerBid;
  let nextEventId = next.nextIds.designerEvent;

  const addEvent = (projectId: string, label: string, detail: string) => {
    next.designerWorkflowEvents = [
      { id: `DWE-${nextEventId}`, projectId, label, detail, created: now.toISOString() },
      ...next.designerWorkflowEvents
    ];
    nextEventId += 1;
  };

  const updateProject = (projectId: string, updates: Partial<DesignerProject>) => {
    next.designerProjects = next.designerProjects.map(project =>
      project.id === projectId ? { ...project, ...updates, updatedAt: now.toISOString() } : project
    );
  };

  for (const project of next.designerProjects) {
    if (project.status === 'completed') continue;

    if (project.status === 'created') {
      updateProject(project.id, { status: 'published_for_bidding' });
      addEvent(project.id, 'Published for bidding', `Visible to active designers eligible for grade ${project.grade}.`);
      messages.push(`${project.id} published for designer bidding.`);
      changed = true;
      continue;
    }

    if (project.status === 'published_for_bidding') {
      const eligible = next.designers.filter(designer => designer.active && designer.grades.includes(project.grade));
      const bids = eligible.map((designer, index) => {
        const workloadBuffer = designer.workload * 2;
        const gradeAdjustment = project.grade === 'A' ? 1 : project.grade === 'B' ? 0 : -1;
        const bidHours = Math.max(4, Math.round(project.estimatedHours * (0.72 + index * 0.08) + workloadBuffer + gradeAdjustment));
        return {
          id: `DB-${nextBidId + index}`,
          projectId: project.id,
          designerId: designer.id,
          bidHours,
          score: scoreDesignerBid(designer, bidHours),
          status: 'valid' as const,
          created: now.toISOString()
        };
      });
      nextBidId += bids.length;
      next.designerBids = [...bids, ...next.designerBids];
      updateProject(project.id, { status: 'bidding_closed' });
      addEvent(project.id, 'Bids generated and closed', `${bids.length} eligible designer bids were scored automatically.`);
      messages.push(`${project.id} received ${bids.length} auto bids.`);
      changed = true;
      continue;
    }

    if (project.status === 'bidding_closed') {
      const bids = next.designerBids.filter(bid => bid.projectId === project.id && bid.status === 'valid');
      const selected = [...bids].sort((a, b) => a.score - b.score)[0];
      if (!selected) continue;
      const designer = next.designers.find(item => item.id === selected.designerId);
      next.designerBids = next.designerBids.map(bid =>
        bid.projectId === project.id
          ? { ...bid, status: bid.id === selected.id ? 'selected' : 'rejected' }
          : bid
      );
      next.designers = next.designers.map(item =>
        item.id === selected.designerId ? { ...item, workload: item.workload + 1 } : item
      );
      updateProject(project.id, {
        status: 'auto_allocated',
        assignedDesignerId: selected.designerId,
        selectedBidId: selected.id
      });
      addEvent(project.id, 'Auto allocated', `${designer?.name || 'Designer'} selected with ${selected.bidHours} hrs and score ${selected.score}.`);
      messages.push(`${project.id} allocated to ${designer?.name || selected.designerId}.`);
      changed = true;
      continue;
    }

    if (project.status === 'auto_allocated') {
      updateProject(project.id, { status: 'in_progress' });
      addEvent(project.id, 'Task started', 'Timer started and designer work moved to in progress.');
      changed = true;
      continue;
    }

    if (project.status === 'in_progress') {
      updateProject(project.id, { status: 'designer_submitted' });
      addEvent(project.id, 'Designer submitted work', 'Deliverable package uploaded to the automated review queue.');
      changed = true;
      continue;
    }

    if (project.status === 'designer_submitted') {
      updateProject(project.id, { status: 'sales_auto_review' });
      addEvent(project.id, 'Auto review started', 'System checklist is validating required files, description match, and deadline compliance.');
      changed = true;
      continue;
    }

    if (project.status === 'sales_auto_review') {
      const shouldRevise = project.revisionCount === 0 && project.priority === 'urgent';
      updateProject(project.id, {
        status: shouldRevise ? 'revision_required' : 'sent_to_client',
        autoReviewPassed: !shouldRevise
      });
      addEvent(
        project.id,
        shouldRevise ? 'Auto review requested revision' : 'Auto review passed',
        shouldRevise ? 'Urgent work failed the completeness threshold and was returned to the same designer.' : 'Checklist passed; work is ready for client delivery.'
      );
      changed = true;
      continue;
    }

    if (project.status === 'sent_to_client') {
      const autoApproval = new Date(now.getTime() + 12 * 1000);
      updateProject(project.id, { status: 'client_review', clientAutoApprovalAt: autoApproval.toISOString() });
      addEvent(project.id, 'Sent to client', 'Client approval link sent. No response triggers automatic approval.');
      changed = true;
      continue;
    }

    if (project.status === 'client_review') {
      const autoApprovalAt = project.clientAutoApprovalAt ? new Date(project.clientAutoApprovalAt) : now;
      if (autoApprovalAt > now) continue;
      const requiresChange = project.revisionCount === 0 && project.priority === 'high';
      updateProject(project.id, {
        status: requiresChange ? 'revision_required' : 'completed',
        completedAt: requiresChange ? null : now.toISOString(),
        clientAutoApprovalAt: null
      });
      addEvent(
        project.id,
        requiresChange ? 'Client changes auto-routed' : 'Client auto-approved',
        requiresChange ? 'Change request returned to the same designer with revision counter updated.' : 'Approval window expired with no change request; project completed.'
      );
      if (!requiresChange) {
        const selectedBid = next.designerBids.find(bid => bid.id === project.selectedBidId);
        const completedOnTime = new Date(project.dueAt) >= now;
        next.designers = next.designers.map(designer => {
          if (designer.id !== project.assignedDesignerId) return designer;
          const totalProjects = designer.totalProjects + 1;
          const totalRevisions = designer.totalRevisions + project.revisionCount;
          const gradeWiseCompleted = {
            ...designer.gradeWiseCompleted,
            [project.grade]: designer.gradeWiseCompleted[project.grade] + 1
          };
          return {
            ...designer,
            workload: Math.max(0, designer.workload - 1),
            totalProjects,
            totalRevisions,
            onTimeRate: Math.round(((designer.onTimeRate * designer.totalProjects) + (completedOnTime ? 100 : 0)) / totalProjects),
            firstApprovalRate: Math.round(((designer.firstApprovalRate * designer.totalProjects) + (project.revisionCount === 0 ? 100 : 0)) / totalProjects),
            avgCompletionHours: Math.round(((designer.avgCompletionHours * designer.totalProjects) + (selectedBid?.bidHours || project.estimatedHours)) / totalProjects),
            gradeWiseCompleted
          };
        });
        messages.push(`${project.id} completed and designer performance updated.`);
      }
      changed = true;
      continue;
    }

    if (project.status === 'revision_required') {
      updateProject(project.id, {
        status: 'in_progress',
        revisionCount: project.revisionCount + 1,
        autoReviewPassed: false
      });
      addEvent(project.id, 'Revision reassigned', 'Same designer received the change request automatically.');
      changed = true;
    }
  }

  if (changed) {
    next.nextIds = {
      ...next.nextIds,
      designerBid: nextBidId,
      designerEvent: nextEventId
    };
  }

  return { state: next, changed, messages };
};
