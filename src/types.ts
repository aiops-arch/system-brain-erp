/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LeadStage = 'new' | 'requirement_collected' | 'quote_sent' | 'approved' | 'lost';
export type LeadTemp = 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  client: string;
  phone: string;
  whatsappId?: string;
  type: string;
  value: number;
  temp: LeadTemp;
  stage: LeadStage;
  followup: string;
  lastActivity: string;
  assignedTo: string;
  createdBy: string;
  created: string;
  activityLogs: ActivityLog[];
  autoReminder: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'call' | 'whatsapp' | 'meeting' | 'note' | 'system';
  content: string;
  timestamp: string;
  performedBy: string;
}

export interface WAMessage {
  id: string;
  leadId: string;
  direction: 'inbound' | 'outbound';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'lead_created' | 'stage_changed' | 'inactive_hours' | 'overdue_followup';
  conditions: { field: string; operator: 'equals' | 'greater_than' | 'less_than'; value: any }[];
  actions: { type: 'send_whatsapp' | 'assign_lead' | 'notify_manager' | 'start_sequence'; params: any }[];
  isActive: boolean;
}

export interface WASequenceStep {
  id: string;
  delayDays: number;
  templateName: string;
  content: string;
}

export interface WASequence {
  id: string;
  name: string;
  steps: WASequenceStep[];
  isActive: boolean;
}

export interface LeadSequenceStatus {
  leadId: string;
  sequenceId: string;
  currentStepIndex: number;
  lastStepSentAt: string;
  status: 'active' | 'completed' | 'paused';
}

export type VacancyStatus = 'open' | 'interviewing' | 'on_hold' | 'closed';
export type VacancyPriority = 'high' | 'medium' | 'low';
export type ExperienceLevel = 'junior' | 'mid' | 'senior';
export type CandidateStage = 'applied' | 'interviewed' | 'practical_test' | 'offered' | 'rejected' | 'hired';

export interface Vacancy {
  id: string;
  jobCode: string;
  title: string;
  status: VacancyStatus;
  priority: VacancyPriority;
  requiredCertifications: string[];
  description: string;
  created: string;
}

export interface Candidate {
  id: string;
  vacancyId: string;
  name: string;
  phone: string;
  email: string;
  certifications: string;
  experienceLevel: ExperienceLevel;
  currentStage: CandidateStage;
  skillTestResult: string;
  noticePeriod: string;
  expectedSalary: number;
  appliedDate: string;
  notes: string;
}

export type MarketingProjectStatus = 'planning' | 'not_started' | 'in_progress' | 'review' | 'completed';
export type ContentType = 'video' | 'photo' | 'both';
export type MarketingGoal = 'portfolio' | 'social' | 'safety';
export type ContentFormat = 'vertical' | 'horizontal';
export type SafetyLevel = 'standard' | 'high_risk';

export interface MarketingProject {
  id: string;
  name: string;
  location: string;
  highlights: string;
  assignedTo: string;
  type: ContentType;
  shootDate: string;
  status: MarketingProjectStatus;
  deadline: string;
  channels: string[];
  primaryGoal: MarketingGoal;
  requiredFormat: ContentFormat;
  onSiteContact: string;
  safetyLevel: SafetyLevel;
  safetyCheck: boolean;
  rawFootageSaved: boolean;
  equipmentCheck: boolean;
  created: string;
}

export type DesignerGrade = 'A' | 'B' | 'C';
export type DesignerProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type DesignerProjectStatus =
  | 'created'
  | 'published_for_bidding'
  | 'bidding_closed'
  | 'auto_allocated'
  | 'in_progress'
  | 'designer_submitted'
  | 'sales_auto_review'
  | 'sent_to_client'
  | 'client_review'
  | 'revision_required'
  | 'completed';

export interface DesignerProfile {
  id: string;
  name: string;
  grades: DesignerGrade[];
  active: boolean;
  workload: number;
  rating: number;
  onTimeRate: number;
  firstApprovalRate: number;
  avgCompletionHours: number;
  totalProjects: number;
  totalRevisions: number;
  gradeWiseCompleted: Record<DesignerGrade, number>;
}

export interface DesignerBid {
  id: string;
  projectId: string;
  designerId: string;
  bidHours: number;
  score: number;
  status: 'valid' | 'selected' | 'rejected';
  created: string;
}

export interface DesignerWorkflowEvent {
  id: string;
  projectId: string;
  label: string;
  detail: string;
  created: string;
}

export interface DesignerProject {
  id: string;
  name: string;
  client: string;
  description: string;
  grade: DesignerGrade;
  priority: DesignerProjectPriority;
  estimatedHours: number;
  status: DesignerProjectStatus;
  assignedDesignerId: string | null;
  selectedBidId: string | null;
  revisionCount: number;
  autoReviewPassed: boolean;
  clientAutoApprovalAt: string | null;
  createdBy: string;
  created: string;
  updatedAt: string;
  dueAt: string;
  completedAt: string | null;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  content: string;
}

export interface ReminderConfig {
  intervalDays: number;
  templateId: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'revised';

export interface Quotation {
  id: string;
  leadId: string;
  client: string;
  type: string;
  version: number;
  material: number;
  labour: number;
  margin: number;
  status: QuoteStatus;
  sentAt: string | null;
  followupDue: string | null;
  created: string;
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  code: string;
  quoteId: string;
  leadId: string;
  client: string;
  type: string;
  value: number;
  status: ProjectStatus;
  advanceReceived: boolean;
  designApproved: boolean;
  deadline: string;
  progress: number;
  designer: string;
  created: string;
}

export type TaskType = 'procurement' | 'cutting' | 'welding' | 'finishing' | 'qc';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked';

export interface Task {
  id: string;
  projectId: string;
  type: TaskType;
  title: string;
  assignee: string;
  status: TaskStatus;
  progress: number;
  due: string;
  machine?: string;
  blockerReason?: string;
}

export type PaymentType = 'advance' | 'final' | 'milestone';
export type PaymentStatus = 'pending' | 'received' | 'overdue';

export interface Payment {
  id: string;
  projectId: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  due: string;
  receivedAt: string | null;
  reminders: number;
}

export type InventoryCategory = 'raw_material' | 'consumable' | 'tool';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  qty: number;
  threshold: number;
  rate: number;
}

export type MRStatus = 'pending' | 'purchase_raised' | 'issued' | 'fulfilled';

export interface MaterialRequest {
  id: string;
  taskId: string;
  projectId: string;
  itemId: string;
  qty: number;
  status: MRStatus;
  requestedBy: string;
  issuedAt: string | null;
  created: string;
}

export type QCResult = 'pending' | 'pass' | 'fail' | 'rework';

export interface QCCheckItem {
  label: string;
  passed: boolean | null;
  note?: string;
}

export interface QCCheck {
  id: string;
  projectId: string;
  taskId: string;
  checkedBy: string;
  result: QCResult;
  items: QCCheckItem[];
  reworkNotes: string;
  checkedAt: string | null;
}

export type DispatchStatus = 'blocked' | 'ready' | 'dispatched' | 'delivered';

export interface Dispatch {
  id: string;
  projectId: string;
  qcId: string;
  paymentCleared: boolean;
  status: DispatchStatus;
  vehicle?: string;
  driver?: string;
  address?: string;
  dispatched: string | null;
  deliveredAt: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  address: string;
  category: string[];
}

export type POStatus = 'draft' | 'sent' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  itemId: string;
  name: string;
  qty: number;
  rate: number;
  gst: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: POStatus;
  expectedDelivery: string;
  receivedAt: string | null;
  created: string;
}

export interface Invoice {
  id: string;
  projectId: string;
  client: string;
  items: { description: string; qty: number; rate: number; gst: number }[];
  subTotal: number;
  gstTotal: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  dueDate: string;
  created: string;
}

export type UserRole = 'admin' | 'manager' | 'operator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  currentLeadCount: number;
}
