# Proposal vs Codebase — Verification Report
> Document: `HQ_20260418_170618.jpg` (Offside Machine Shops LLP — Custom ERP-CRM Platform Proposal, April 2026)
> Verified: 2026-04-18 | Reviewer: Claude Code

**Legend:** ✅ Present & Working | ⚠️ Partially Done | ❌ Missing / Not Built

---

## Section 1 — 17 Modules Claim

The proposal states **"17 Modules — Fully Delivered"**.

| # | Module Name (Proposal) | Component in Code | Status | Notes |
|---|---|---|---|---|
| 01 | CRM / Sales | `CRMView.tsx` | ✅ | Full lead pipeline, kanban, activity log |
| 02 | CRM Automation | `CRMAutomation.tsx` | ✅ | WA sequences, auto-reminders, rules engine |
| 03 | Quotations | `QuotationsView.tsx` | ✅ | Draft/send/approve, PDF export |
| 04 | Projects | `ProjectsView.tsx` | ✅ | Status, progress, gates |
| 05 | Production | `ProductionView.tsx` | ✅ | Task tracking, progress updates |
| 06 | **Workshop Mobile** | ❌ No file | ❌ **MISSING** | Zero mobile view, no responsive layout, no dedicated mobile component anywhere in `src/` |
| 07 | Inventory | `InventoryView.tsx` | ✅ | Stock levels, threshold alerts, wastage |
| 08 | Purchase / PO | `PurchaseView.tsx` | ✅ | PO creation, supplier management, GRN |
| 09 | Quality Control | `QCView.tsx` | ✅ | Checklist, pass/fail/rework result |
| 10 | Dispatch | `DispatchView.tsx` | ✅ | Dispatch + delivery tracking |
| 11 | Invoices + GST | `InvoicesView.tsx` | ✅ | GST calculation, PDF generation |
| 12 | Payments | `PaymentsView.tsx` | ✅ | Advance/final/milestone tracking |
| 13 | HR / Vacancies | `HRView.tsx` | ✅ | Vacancy pipeline, candidate stages |
| 14 | Marketing | `MarketingView.tsx` | ✅ | Shoot scheduling, content tracking |
| 15 | Reports / Analytics | `ReportsView.tsx` | ⚠️ | Revenue/expenses/conversion present. Hardcoded "+12% last month". No time-range filter. |
| 16 | **PRD & ROI** | ❌ No file | ❌ **MISSING** | No dedicated PRD (Project Requirements Document) view. No ROI calculator. No profitability per-project screen. ReportsView has basic revenue/expense summary only. |
| 17 | Team / Users | `UsersView.tsx` | ✅ | User list, role display, admin actions |

**Module Score: 15 / 17 delivered (88%)**

---

## Section 2 — 13-Step Gated Workflow

The proposal lists a 13-step gated workflow with 2 HARD GATEs.

| Step | Name | Gate Type | Status | What Exists / What's Missing |
|---|---|---|---|---|
| 1 | Sales Intake — MOM must be recorded | Soft | ❌ **MISSING** | Leads have `activityLogs` but no structured MOM (Minutes of Meeting) form. No required field that blocks progression without MOM entry. |
| 2 | Designer Allocation — Designer assigned | Soft | ⚠️ | `designer` field exists on Project model. But there is no assignment workflow or notification — it defaults to hardcoded `'Rahul S.'` in `autoCreateProject()`. |
| 3 | Design Approval — Client sign-off confirmed | Soft | ✅ | `approveDesign()` handler exists. `designApproved` boolean gate is enforced before tasks are created. |
| 4 | BOM & Quotation — Internal cross-check done | Soft | ⚠️ | QuotationForm exists with material/labour fields. No internal review checkbox or approval step. No BOM (Bill of Materials) line-item entry — just lump-sum material cost. |
| 5 | Advance Payment — 30% advance received | **HARD GATE** | ✅ | `advanceReceived` gate enforced. `checkGates()` in `store.ts` blocks production start. Production tasks only auto-created after design approval + advance. |
| 6 | Fabrication — 100% materials secured | Soft | ⚠️ | Material Requests and inventory system exist. But there is no gate that blocks task start if materials are not issued. A task can be marked `in_progress` even if the MR is still `pending`. |
| 7 | Resource Assignment — Production 100% complete | Soft | ✅ | Tasks have `assignee` field. Progress auto-rolls up to project level. |
| 8 | QC Sign-off — Pass result mandatory | **HARD GATE** | ✅ | `canDispatch()` in `store.ts` requires QC result = `'pass'` before dispatch. Hard gate enforced. |
| 9 | Installation — On-site completion confirmed | Soft | ❌ **MISSING** | `Dispatch` model only has `dispatched` and `deliveredAt` timestamps. No `installationConfirmedAt`, no on-site sign-off step, no installation notes field. |
| 10 | Final Accounting — Sales set to Close Win | Soft | ❌ **MISSING** | Lead stage `'approved'` exists but this happens at quotation approval, not at project completion. There is no final "Close Win" step that triggers after delivery + payment. No closing entry in accounting. |
| 11 | Feedback Loop — Client feedback recorded | Soft | ❌ **MISSING** | No client feedback form, no feedback field on any model, no feedback view or score. |
| 12 | Dispatch Gate — QC passed + ALL payments cleared | **HARD GATE** | ✅ | `canDispatch()` checks both QC pass and all payments received. |
| 13 | *(The proposal numbers this as a workflow ending at Dispatch Gate — 12 unique named steps + dispatch)* | — | — | — |

**Workflow Score: 5 fully implemented, 4 partially, 4 missing**

**The 2 HARD GATEs (Advance Payment + QC Sign-off) are both working correctly.**

---

## Section 3 — Tech Stack

| Technology | Proposal Claims | Reality in Code | Status |
|---|---|---|---|
| React 19 + TypeScript | ✅ | `react: ^19.0.0` in `package.json` | ✅ |
| Vite | ✅ | `vite: ^6.2.0` in `package.json` | ✅ |
| Tailwind CSS | ✅ | `tailwindcss: ^4.1.14` in `package.json` | ✅ |
| **Firebase Auth** | ✅ | `firebase` — **NOT in `package.json`**, not imported anywhere in `src/` | ❌ **MISSING** |
| **Firestore** | ✅ | `firebase` — **NOT in `package.json`**, not imported anywhere in `src/` | ❌ **MISSING** |
| Recharts | ✅ | `recharts: ^3.8.1` in `package.json` | ✅ |
| **D3** | ✅ | `d3` — **NOT in `package.json`**, not imported anywhere | ❌ **MISSING** |
| jsPDF | ✅ | `jspdf: ^4.2.1` in `package.json` | ✅ |
| Express API | ✅ | `server.ts` exists with Express routes | ⚠️ |
| Gemini AI (Phase 3) | "ready" | `@google/genai: ^1.29.0` in `package.json` — package installed but no integration code written yet | ⚠️ |

**Critical gap: Firebase is listed as a core deliverable but is completely absent from the codebase.**
The app uses `localStorage` instead of Firestore. This means:
- All data is per-browser, per-device
- No login or authentication exists
- Two users cannot share data
- Data is lost if browser cache is cleared
- No cloud backup

---

## Section 4 — User Role Levels (3 Levels Claimed)

The proposal states **3 User Role Levels: Admin / Manager / Operator**

| Claim | Status | Detail |
|---|---|---|
| 3 role types defined | ✅ | `UserRole = 'admin' \| 'manager' \| 'operator'` in `types.ts` |
| Users have role assigned | ✅ | `UserProfile.role` field exists, mockData has all 3 roles |
| Admin sees all modules | ⚠️ | All users see all modules — no gating at all |
| Manager access restricted | ❌ | A manager can access Users, Finance, HR — everything |
| Operator access restricted | ❌ | An operator can see and modify everything including user management |
| Role-based nav hiding | ❌ | No sidebar nav items are hidden by role |
| Role check in UI | ⚠️ | Only 2 places: (1) lead assignment filters managers/admins, (2) UsersView shows admin-only delete button |

**Roles exist in the data model but do not gate any views, actions, or data.**
Any logged-in user (if login existed) would see the full system regardless of role.

---

## Section 5 — ₹50K Investment / Phase Claims

The proposal states:
- **Phase 1 & 2: Complete and live. All 17 modules.**
- **Phase 3: AI Intelligence Layer — ready for activation.**

Based on code verification:

| Phase | Claim | Reality |
|---|---|---|
| Phase 1 & 2 — All 17 modules | ✅ Claimed complete | 15/17 modules present (Workshop Mobile and PRD & ROI missing) |
| Phase 1 & 2 — Firebase Auth | ✅ Listed in tech stack | ❌ Not implemented at all |
| Phase 1 & 2 — Role-based access | ✅ "3 User Role Levels" | ⚠️ Roles exist in data, no access control enforced |
| Phase 1 & 2 — 13-step workflow | ✅ Claimed | 5 fully done, 4 partial, 4 missing |
| Phase 3 — Gemini AI | "ready" | Package installed, no code written |

---

## Section 6 — Handwritten Notes on the Document

Three notes were handwritten at the bottom:

| Note | Interpretation | Status in Code |
|---|---|---|
| **"Sahil (Account) Data Entry work"** | An accountant role (Sahil) needs a data entry interface — likely for entering payments, invoices, or purchase data | ❌ No simplified data-entry view for accountant role. All views are full-featured. No "Sahil" user in mockData. |
| **"Reminder Daily — No salary for Dhaval alav"** | Possibly means: a daily reminder automation, and Dhaval's account should be restricted (no salary visibility)? Or it's a payment/HR note about a specific person. | ❌ No daily reminder (current reminders are event-based, not daily scheduled). No salary field in HR module. |
| **"Cloud Data — Firebase Safety"** | Firebase should be integrated for cloud data safety / backup | ❌ Firebase completely absent from code. This is the same gap as Section 3. |

---

## Summary — What Needs to Be Built / Fixed

### Missing Modules (2)
1. **Workshop Mobile** — Mobile-responsive view for floor workers to update task progress from phones
2. **PRD & ROI** — Per-project profitability view showing cost vs revenue vs margin, ROI calculation

### Missing from 13-Step Workflow (4)
3. **MOM Recording** — Structured Minutes of Meeting form on leads before stage can change
4. **Installation Confirmation** — New step between Dispatch and Delivery for on-site sign-off
5. **Close Win / Final Accounting** — Closing entry when project is fully complete and paid
6. **Client Feedback Loop** — Post-delivery feedback form / rating

### Missing Tech Stack (critical)
7. **Firebase Auth** — Login system. Currently anyone with the URL has full admin access
8. **Firestore** — Cloud database. Currently all data is in browser localStorage only
9. **D3** — Listed in proposal but not installed or used

### Missing Access Control
10. **Role-based module gating** — Operators should not see Finance, HR, Users, Reports
11. **Role-based action gating** — Only Admin should approve quotes, mark payments received, etc.

### Partially Done
12. **Designer Allocation** — Hardcoded to 'Rahul S.', needs proper assignment UI
13. **BOM** — Only lump-sum material cost, no line-item Bill of Materials
14. **Materials Gate** — No hard block on task start if materials not issued
15. **Reports** — Hardcoded "+12% from last month", no date range filter
16. **Gemini AI** — Package installed but Phase 3 integration code not started
17. **Express API** — Server routes exist but frontend never calls them

---

## Priority Order to Complete Phase 1 & 2 Properly

| Priority | Item | Effort |
|---|---|---|
| 🔴 Critical | Firebase Auth — add login | High |
| 🔴 Critical | Firestore — migrate from localStorage | High |
| 🔴 High | Role-based access control on nav + actions | Medium |
| 🔴 High | Workshop Mobile view | Medium |
| 🟡 Medium | PRD & ROI module | Medium |
| 🟡 Medium | MOM recording on leads | Low |
| 🟡 Medium | Installation confirmation step on Dispatch | Low |
| 🟡 Medium | Client Feedback Loop | Low |
| 🟡 Medium | Close Win / Final Accounting step | Low |
| 🟢 Low | BOM line-item entry on quotations | Medium |
| 🟢 Low | Designer assignment workflow | Low |
| 🟢 Low | Materials gate before task start | Low |
| 🟢 Low | Reports date range filter | Low |
