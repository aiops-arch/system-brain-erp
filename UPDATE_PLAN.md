# System Brain ERP — Full Autonomous AI Rebuild Plan
> Offside Machine Shops LLP | Updated: 2026-04-18
> Vision: Zero human dependency. The system runs, thinks, communicates, and predicts on its own.

---

## The Core Idea

The current system is a **passive tool** — it only does something when a human opens it and
clicks a button. The goal is to flip this completely.

The new system should:
- **Push information** to people instead of waiting for them to log in
- **Make decisions** automatically based on rules and AI
- **Predict problems** before they happen (delayed projects, bad quotes, late payments)
- **Communicate** with clients, vendors, and the team without anyone touching the ERP
- **Learn** from historical data to get smarter over time
- **Run itself** — the owner should be able to go on vacation and come back to a working business

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYSTEM BRAIN AI CORE                          │
│                                                                       │
│   ┌─────────────┐   ┌─────────────┐   ┌────────────┐   ┌─────────┐ │
│   │  Gemini AI  │   │   Rules     │   │  Scheduler │   │  Event  │ │
│   │  Engine     │   │   Engine    │   │  (Cron)    │   │  Bus    │ │
│   │  Predictions│   │  Hard Gates │   │  Daily 9am │   │Triggers │ │
│   └──────┬──────┘   └──────┬──────┘   └─────┬──────┘   └────┬────┘ │
└──────────┼─────────────────┼────────────────┼───────────────┼───────┘
           │                 │                │               │
┌──────────▼─────────────────▼────────────────▼───────────────▼───────┐
│                      FIREBASE FIRESTORE (Real-time Cloud DB)          │
│   Leads · Quotations · Projects · Tasks · Payments · Inventory        │
│   QC · Dispatch · HR · Marketing · Invoices · Suppliers · Logs        │
└───────────┬──────────────────┬──────────────────┬────────────────────┘
            │                  │                  │
  ┌─────────▼──────┐  ┌────────▼───────┐  ┌──────▼──────────────┐
  │  COMMUNICATION │  │  INTEGRATIONS  │  │  CLIENT / VENDOR     │
  │                │  │                │  │  PORTALS             │
  │  WhatsApp API  │  │  Tally Export  │  │  Track Order (link)  │
  │  Email/SMTP    │  │  Google Cal    │  │  Approve Quote (link)│
  │  Push (FCM)    │  │  Bank Feed     │  │  Vendor PO confirm   │
  │  SMS (fallback)│  │  e-Invoice IRP │  │  Client Feedback     │
  └────────────────┘  └────────────────┘  └─────────────────────┘
            │
  ┌─────────▼──────────────────────────────────────────────┐
  │                  PEOPLE (Receive, Don't Log In)         │
  │  Mayur (Owner)  ·  Floor Workers  ·  Clients           │
  │  Sales Team     ·  Vendors        ·  Accountant        │
  └────────────────────────────────────────────────────────┘
```

---

## Phase 0 — Fix Current Bugs First (Before Anything Else)
> Estimated time: 1–2 days | Do this before touching anything new

These are silent data corruption bugs in the current code. Fixing these first ensures the
foundation is clean before we build on top.

| # | Bug | File | Fix |
|---|-----|------|-----|
| 0.1 | Reset button uses wrong localStorage key | `App.tsx:1174` | Change `'fabrication_erp_state'` → import `STORE_KEY` from `store.ts` |
| 0.2 | Inventory and Invoice share same ID counter + `INV-` prefix | `App.tsx:752`, `store.ts:300` | Add `item` counter to `nextIds`, change inventory prefix to `ITEM-` |
| 0.3 | Material Request counter reads `nextIds.mr` (undefined) | `App.tsx:789` | Change all `nextIds.mr` → `nextIds.mrq` |
| 0.4 | Dashboard "New Lead" button passes MouseEvent as lead data | `App.tsx:1200` | Change `onClick={addLead}` → `onClick={() => setModalType('new_lead')}` |
| 0.5 | Duplicate tasks created if design approved twice | `App.tsx:982` | Add guard: check if tasks already exist for project before calling `autoCreateTasks` |
| 0.6 | Quote revision always creates same ID (`Q-X-R1`) | `App.tsx:271` | Use `nextIds.quote` counter instead of hardcoded `-R1` suffix |
| 0.7 | Two separate project creation paths with different logic | `App.tsx:328`, `store.ts:377` | Merge into one function, use `autoCreateProject` from store everywhere |
| 0.8 | PDF footer line hardcoded at wrong y position | `App.tsx:525,708` | Change `doc.line(14, 57, 75, 57)` → `doc.line(14, finalY + 57, 75, finalY + 57)` |
| 0.9 | Placeholder client info in PDFs (`XYZ Enterprises`) | `App.tsx:470–474` | Look up real lead data via `quote.leadId` and use actual phone/email |
| 0.10 | Auto-reminder fires every 30 seconds | `App.tsx:162` | Change `30000` → `300000` (5 min) minimum |

---

## Phase 1 — Foundation: Cloud Database + Authentication
> Estimated time: 1 week | Everything else requires this

Nothing in Phase 2 onwards is possible without a real database and real login.
Right now data lives in the browser. Two people cannot share it. There is no security.

---

### 1.1 — Firebase Project Setup

**One-time setup (not code):**
1. Go to `console.firebase.google.com`
2. Create project: `system-brain-offside`
3. Enable **Firestore Database** (production mode)
4. Enable **Authentication** → Email/Password
5. Enable **Cloud Messaging** (for push notifications)
6. Download `serviceAccountKey.json` → place in `/server/` (never commit to git)
7. Copy Firebase config (apiKey, projectId etc.) → create `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_GEMINI_API_KEY=...
   VITE_WATI_API_KEY=...
   VITE_WATI_BASE_URL=...
   ```

**Install packages:**
```bash
npm install firebase
npm install firebase-admin    # for server-side
npm install node-cron         # for scheduled jobs
npm install nodemailer        # for email
npm install @sendgrid/mail    # alternative for email
```

---

### 1.2 — Firestore Database Schema

Design the collections before writing any code. Each Firestore collection maps to a
current TypeScript type. Keep the same shape — just replace `localStorage` with Firestore.

```
firestore/
├── users/              {UserProfile}
├── leads/              {Lead}          ← sub-collection: activityLogs/
├── quotations/         {Quotation}
├── projects/           {Project}
├── tasks/              {Task}
├── payments/           {Payment}
├── inventory/          {InventoryItem}
├── materialRequests/   {MaterialRequest}
├── purchaseOrders/     {PurchaseOrder}
│   └── items/          {PurchaseOrderItem}
├── suppliers/          {Supplier}
├── invoices/           {Invoice}
│   └── items/          sub-collection
├── qcChecks/           {QCCheck}
├── dispatches/         {Dispatch}
├── vacancies/          {Vacancy}
├── candidates/         {Candidate}
├── marketingProjects/  {MarketingProject}
├── waSequences/        {WASequence}
├── automationRules/    {AutomationRule}
├── aiInsights/         ← NEW: stores AI predictions and recommendations
├── notifications/      ← NEW: push notification log
├── attendance/         ← NEW: worker clock-in/out
├── feedbackResponses/  ← NEW: client feedback after delivery
└── config/             ← system settings (reminderConfig, etc.)
```

**Firestore Security Rules (important — prevents unauthorized access):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    // Public tracking portal (read-only, by shareToken)
    match /projects/{projectId} {
      allow read: if resource.data.shareToken == request.query.token;
    }
  }
}
```

---

### 1.3 — Migrate Frontend from localStorage to Firestore

**What to do:**
1. Create `src/lib/firebase.ts` — initialise Firebase app and export `db`, `auth`
2. Create `src/lib/db.ts` — typed wrapper functions:
   ```ts
   export const getLeads = () => getDocs(collection(db, 'leads'))
   export const updateLead = (id, data) => updateDoc(doc(db, 'leads', id), data)
   export const addLead = (data) => addDoc(collection(db, 'leads'), data)
   // ... one function per entity per action
   ```
3. Replace `loadState()` in `App.tsx` with `useEffect` that sets up Firestore real-time
   listeners (`onSnapshot`) — data updates automatically when anyone changes anything
4. Replace `saveState()` calls with the corresponding Firestore write function
5. Delete `src/lib/store.ts` localStorage save/load logic (keep the rule engine functions)
6. The real-time listeners mean: if a floor worker marks a task done on mobile, Mayur's
   desktop dashboard updates instantly with no refresh

**Migration order (least risky first):**
1. Users → Login (needed for everything)
2. Inventory → low complexity
3. Tasks + Projects → medium
4. Leads + Quotations → high (most logic)
5. Payments + Invoices → last (most sensitive)

---

### 1.4 — Login System + Role-Based Access

**What to build:** `src/pages/LoginPage.tsx`
- Email + password form (Firebase Auth)
- On login: look up user's `UserProfile` in Firestore by `uid`
- Store `currentUser` in React Context (not in localStorage)
- Protect all routes — if not logged in, redirect to `/login`

**Role gates — implement in `src/lib/permissions.ts`:**
```ts
export const PERMISSIONS = {
  admin:    ['*'],  // everything
  manager:  ['crm','quotations','projects','production','qc',
             'dispatch','payments','invoices','inventory',
             'purchase','reports','marketing','hr'],
  operator: ['floor'],  // only the mobile floor view
  accountant: ['invoices','payments','purchase','reports'],  // new role
}

export const canAccess = (role: UserRole, view: string) => {
  const allowed = PERMISSIONS[role]
  return allowed.includes('*') || allowed.includes(view)
}
```

**Add `accountant` as a 4th role** (from handwritten note: "Sahil — Account Data Entry"):
- Sees only: Invoices, Payments, Purchase Orders, Reports
- Cannot see: CRM, HR, Production floor data, Marketing

In sidebar rendering, filter `navItems` by `canAccess(currentUser.role, item.id)` so
each person only sees their relevant modules.

---

## Phase 2 — The AI Brain (Gemini Integration)
> Estimated time: 1 week | Package already installed (`@google/genai`)

---

### 2.1 — AI Service Layer

Create `src/lib/ai.ts` — the single file all AI calls go through.
This keeps the Gemini API key in one place and makes it easy to swap models later.

```ts
import { GoogleGenAI } from '@google/genai'
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

export const askGemini = async (prompt: string, context: object) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',   // fast + cheap for real-time use
    contents: `${prompt}\n\nContext data:\n${JSON.stringify(context, null, 2)}`
  })
  return response.text
}
```

Use `gemini-2.0-flash` for real-time features (fast, cheap).
Use `gemini-2.5-pro` only for deep analysis tasks (batch, not real-time).

Store all AI outputs in the `aiInsights` Firestore collection with a timestamp so they
can be retrieved without re-calling the API every time.

---

### 2.2 — Quotation Profit/Loss Predictor (Critical Feature)

**The problem it solves:**
A quote might look fine on paper (material + labour + margin) but lose money because:
- Material costs have risen since the last similar project
- Labour estimate is lower than actual hours historically
- Client has a history of requesting scope changes
- Similar projects in the past had high rework cost
- Delivery distance adds unaccounted logistics cost

**How it works:**

When a user is filling in the Quotation Form, before they hit "Save":

1. Collect all available context:
   ```
   - Quote type (e.g. "Structural Fabrication")
   - Material cost entered
   - Labour cost entered
   - Margin %
   - Client history: past quotes for this client, win/loss, actual project costs
   - Last 10 similar project types: budgeted vs actual cost
   - Current raw material rates from recent POs (steel, SS, MS)
   - Lead temperature and stage
   ```

2. Send to Gemini with a structured prompt:
   ```
   You are a financial advisor for a fabrication company.
   Analyse this quotation and predict:
   1. Profit/loss risk (HIGH / MEDIUM / LOW)
   2. Estimated actual margin after typical overruns (as %)
   3. Top 3 cost risk factors specific to this project type
   4. Recommended selling price for a healthy 25% net margin
   5. Win probability at this price (based on historical data provided)
   Give a brief plain-English explanation the owner can read in 10 seconds.
   ```

3. Show the result inside the QuotationForm before save:
   ```
   ┌─────────────────────────────────────────────┐
   │  AI Risk Assessment                    🔴    │
   │  Profit Risk: HIGH                           │
   │  Estimated actual margin: 11% (vs 18% shown)│
   │  Why: Steel prices up 12% since last PO.    │
   │       Similar jobs averaged 15% overrun.    │
   │  Recommended price: ₹4,85,000 for 25% margin│
   │  Win probability at this price: 65%         │
   └─────────────────────────────────────────────┘
   ```

4. Store this assessment on the `Quotation` document in Firestore as `aiAssessment: { ... }`

**Where to build:**
- `src/components/modals/QuotationForm.tsx` — add AI panel
- `src/lib/ai.ts` — add `analyzeQuotation(quote, historicalData)` function
- `src/types.ts` — add `aiAssessment` field to `Quotation` type

---

### 2.3 — Lead Conversion Score

Every lead gets an AI-generated score (1–10) with reasoning. Updated automatically when:
- Lead is created
- Stage changes
- A new activity is logged
- Follow-up date passes without contact

**Scoring factors Gemini considers:**
- Lead temperature (hot/warm/cold)
- Value vs average deal size
- How quickly requirements were collected
- Response rate (activity log frequency)
- Client company history (if seen before)
- Time since last contact
- Similarity to past won/lost leads

**Display:** Badge on each lead card in CRMView
```
[Lead Card: Suresh Industries]
AI Score: 8/10 ▲     ← green = rising, red = falling
"High intent. Requested quote revision quickly.
 Similar to PRJ-38 which closed. Follow up today."
```

**Where to build:**
- `src/components/CRMView.tsx` — add score badge
- `src/lib/ai.ts` — add `scoreLead(lead, history)` function
- Firestore trigger (Cloud Function) — recalculate when lead doc changes

---

### 2.4 — Project Delay Risk Predictor

Every active project gets a risk score updated daily. Shown on the Projects dashboard.

**Gemini considers:**
- Current progress % vs expected progress at this date
- Number of tasks in `blocked` status
- Pending material requests
- QC failure history on this project
- Days remaining vs remaining tasks
- Historical delay rate for this project type
- Team workload (how many other active projects)

**Output shown:**
```
PRJ-41  [Suresh Industries — Structural Frame]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: 45%  |  Expected: 60%  |  Due: 8 May
Delay Risk: 🔴 HIGH (AI Confidence: 82%)
"2 welding tasks blocked. MS pipe MR pending 4 days.
 At current rate, delivery will slip 6–8 days.
 Action: Call Ratan Steel today for delivery update."
```

**Where to build:**
- `src/components/ProjectsView.tsx` — add risk badge column
- `server/jobs/projectRiskJob.ts` — daily cron that runs analysis for all active projects
- Store result in `projects/{id}.aiRisk` in Firestore

---

### 2.5 — Cash Flow Forecasting

The owner needs to know: "Will I have enough money next month?"

**What it predicts (30/60/90 day view):**
- Expected inflows: pending payments by due date + probability of collection
- Expected outflows: upcoming POs + estimated material costs for active projects
- Net cash position per week for the next 3 months
- "Danger weeks" highlighted in red

**Gemini prompt adds intelligence:**
- Client payment behavior history (Suresh always pays 2 weeks late)
- Seasonality patterns (if historical data exists)
- Probability-weighted collection (overdue invoice = 60% collection probability)

**Display:** New "Cash Flow" tab in `ReportsView.tsx` — a timeline chart (Recharts AreaChart)
showing green (inflow) and red (outflow) bars by week.

---

### 2.6 — Inventory Demand Forecasting

Before a project starts, the system should automatically predict what materials will be
needed and flag if stock is insufficient.

**How it works:**
1. When a project is created from a quote, read the `type` field (e.g., "MS Structural Frame")
2. Look at all past projects of the same type → average material consumption
3. Check current inventory levels
4. Generate a predicted shortfall report:
   ```
   PRJ-42 created: MS Structural Frame
   ──────────────────────────────────────
   AI Inventory Forecast:
   • MS Pipe (2") — Need ~120kg, Have 45kg → SHORTFALL 75kg
   • MS Flat (6mm) — Need ~200kg, Have 380kg → OK
   • Welding Electrodes — Need ~8kg, Have 3kg → SHORTFALL 5kg

   Recommended PO: Auto-draft raised for approval →
   ```
3. Auto-draft a Purchase Order for the shortfall items
4. Send notification to purchase manager: "Review auto-drafted PO for PRJ-42"

---

### 2.7 — Smart Daily Briefing (Owner's Morning Report)

Every day at 9:00am, Gemini reads the entire system state and generates a personalised
briefing. Delivered via WhatsApp to Mayur's phone. He reads it with his morning chai
without opening the ERP.

**Briefing structure:**
```
🏭 System Brain — Daily Briefing
Good morning, Mayur. 18 Apr 2026.

📊 BUSINESS HEALTH: MODERATE ⚠️

URGENT (needs you today):
1. PRJ-41 delayed 6 days — welding blocked, call Ratan Steel
2. Suresh Industries payment ₹2.1L overdue 15 days — 3rd reminder sent
3. L-98 (Pramod Fab) — quote not followed up 5 days, hot lead going cold

PIPELINE:
• 4 active quotes worth ₹18.4L — 2 likely to close this week
• New lead from Gupta Engineering — auto-assigned to Rahul

CASH POSITION:
• This week: +₹3.2L expected, -₹1.8L PO payments
• Net: +₹1.4L (healthy)
• Warning: Week of 5 May — net outflow ₹2.1L projected

PRODUCTION:
• 3 projects on track, 1 delayed (PRJ-41)
• QC pending for PRJ-39 — due today
• 2 items low stock (MS Pipe, Electrodes) — PO auto-drafted

AI RECOMMENDATION:
Focus on PRJ-41 unblock and Suresh payment collection.
Both resolve in 2 days if acted on today.

View full details: app.systembrainoffside.com
```

**How to build:**
- `server/jobs/dailyBriefingJob.ts` — cron at 9:00am IST daily
- Reads all Firestore collections
- Builds context object
- Calls Gemini to generate the briefing text
- Sends via WhatsApp (Wati API) to all `admin` role users

---

## Phase 3 — Communication Automation Engine
> Estimated time: 1 week | Requires Phase 1 (Firebase) and WhatsApp API setup

---

### 3.1 — WhatsApp Business API Setup (Wati)

**One-time setup:**
1. Register at `wati.io` (₹2,999/month for basic, enough for this scale)
2. Connect your WhatsApp Business number
3. Submit message templates for WhatsApp approval (takes 24–48 hours):
   - `welcome_lead` — triggered when lead created
   - `quote_sent` — when quotation is sent
   - `payment_reminder_1/2/3` — escalating payment reminders
   - `project_update` — milestone progress update
   - `dispatch_notification` — order shipped
   - `feedback_request` — post-delivery
   - `daily_briefing` — owner morning report (use document template)
4. Store Wati API key in `.env`

**Create `server/lib/whatsapp.ts`:**
```ts
export const sendWhatsApp = async (phone: string, template: string, params: string[]) => {
  await fetch(`${WATI_BASE_URL}/api/v1/sendTemplateMessage`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WATI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ whatsappNumber: phone, broadcast_name: template, parameters: params })
  })
  // Log to Firestore: notifications/{id}
}
```

---

### 3.2 — Inbound WhatsApp → Auto Lead Creation

When a new number sends a WhatsApp message to your business number, it should
automatically create a lead in the CRM.

**How Wati handles this:**
1. Wati receives the inbound message
2. Wati calls your webhook: `POST /api/webhook/whatsapp`
3. Your server creates a new lead in Firestore
4. Auto-sends welcome template back
5. Assigns to the least-loaded sales person

**What to build in `server.ts`:**
```ts
app.post('/api/webhook/whatsapp', async (req, res) => {
  const { waId, senderName, text } = req.body
  // Check if lead exists for this number
  const existing = await db.collection('leads').where('phone', '==', waId).get()
  if (existing.empty) {
    // Create new lead
    await db.collection('leads').add({
      client: senderName,
      phone: waId,
      stage: 'new',
      temp: 'warm',
      source: 'WhatsApp Inbound',
      created: new Date().toISOString(),
      activityLogs: [{ type: 'whatsapp', content: `First message: "${text}"`, ... }]
    })
    // Send welcome message
    await sendWhatsApp(waId, 'welcome_lead', [senderName])
  } else {
    // Add to existing lead's activity log
  }
})
```

---

### 3.3 — Full Communication Sequence Map

Every event in the system triggers automatic communication. No human needs to remember to
send anything. Below is the complete map of what gets sent, to whom, and when.

#### CLIENT COMMUNICATION (Automatic)

| Trigger | Delay | Message To | Template |
|---------|-------|------------|----------|
| Lead created (inbound WA) | Immediate | Client | `welcome_lead` — "Hi [Name], thanks for reaching out to Offside Machine Shops! We'll contact you shortly." |
| Lead stage → `requirement_collected` | Immediate | Client | `requirements_confirmed` — "We've noted your requirements. Our team is preparing a quotation." |
| Quotation sent | Immediate | Client | `quote_sent` — "Your quotation [Q-X] for ₹[amount] is ready. Valid for 7 days." + PDF link |
| Quote not responded to | +3 days | Client | `quote_followup_1` — "Did you get a chance to review our quotation?" |
| Quote not responded to | +7 days | Client | `quote_followup_2` — "Last reminder — quote validity expires tomorrow. Reply to proceed." |
| Quote approved | Immediate | Client | `quote_approved` — "Great news! We'll begin fabrication once advance payment is received." |
| Advance payment received | Immediate | Client | `work_started` — "We've received your advance. Fabrication begins [date]. Expected delivery: [date]." |
| Project hits 50% progress | Automatic | Client | `progress_update_50` — "Work is 50% complete on your project. On track for [deadline]." |
| QC passed | Immediate | Client | `qc_passed` — "Your fabrication has passed quality inspection. Ready for dispatch." |
| Dispatched | Immediate | Client | `dispatch_notification` — "Your order is on the way. Vehicle: [vehicle], Driver: [driver]. Tracking: [link]" |
| Delivered | +1 day | Client | `feedback_request` — "Your order was delivered. Please rate our service: [link]" |
| Invoice sent | Immediate | Client | `invoice_sent` — "Invoice [INV-X] for ₹[amount] is due on [date]." + PDF link |
| Payment due | -3 days | Client | `payment_reminder_soft` — "Friendly reminder: ₹[amount] due in 3 days." |
| Payment overdue | +1 day | Client | `payment_reminder_1` — "Payment of ₹[amount] was due yesterday. Please clear at earliest." |
| Payment overdue | +7 days | Client | `payment_reminder_2` — "Second reminder: ₹[amount] overdue 7 days. Please contact us." |
| Payment overdue | +15 days | Client + Manager | `payment_escalation` — Escalated to manager + client gets formal notice |

#### TEAM COMMUNICATION (Internal Notifications)

| Trigger | Who Gets Notified | Channel | Message |
|---------|------------------|---------|---------|
| New lead created | Assigned sales person | WhatsApp | "New lead assigned: [Client]. Phone: [number]. Value: ₹[value]. Follow up today." |
| Lead inactive 48h | Assigned person + manager | WA | "Lead [Client] has had no activity for 48 hours. Follow up needed." |
| Quote approved | Designer | WA | "Quote [Q-X] approved. Begin design for [Client] — [project type]." |
| Design approved | Production manager | WA | "Design approved for [Client]. Tasks auto-created. Production can begin." |
| Task blocked | Team lead + manager | WA | "Task [T-X] is blocked: [reason]. Project [PRJ-X] may be delayed." |
| QC failed | QC engineer + production head | WA | "QC failed for [PRJ-X]. Rework required: [notes]. Estimated delay: [days]." |
| Low stock below threshold | Purchase manager | WA | "[Item name] is below threshold ([qty] remaining). PO auto-drafted." |
| Payment received | Accounts + owner | WA | "Payment received ₹[amount] from [Client] for [PRJ-X]." |
| Project delayed past deadline | Owner + manager | WA | "ALERT: [PRJ-X] is past deadline. Current progress: [%]. Expected completion: [AI estimate]." |
| New candidate applied | HR manager | WA | "New application for [Job Title] from [Name]. Skills: [certifications]." |

#### VENDOR COMMUNICATION (Supplier Automation)

| Trigger | Who | Message |
|---------|-----|---------|
| PO created | Supplier | WA/Email — "Purchase Order [PO-X] raised for [items]. Please confirm by [date]." + PDF |
| PO not confirmed | Supplier | +2 days — "Reminder: Please confirm PO [PO-X]. We need delivery by [date]." |
| PO expected delivery approaching | Supplier | -2 days — "PO [PO-X] delivery expected in 2 days. Please confirm on-time delivery." |
| PO overdue (not received) | Supplier + Purchase Manager | Escalation — "PO [PO-X] is overdue. This is blocking production for [PRJ-X]." |

---

### 3.4 — Email Automation (Backup + Formal)

WhatsApp for speed. Email for formality.

**Setup:** Use `nodemailer` with Gmail SMTP or SendGrid (free tier: 100 emails/day).

**When email is used (in addition to WhatsApp):**
- Quotation sent → PDF attached to email
- Invoice sent → PDF attached to email  
- Payment receipt → formal email receipt
- Weekly summary report → formatted HTML email to owner
- Candidates applied → email acknowledgment to candidate

**Create `server/lib/email.ts`:**
```ts
export const sendEmail = async ({ to, subject, html, attachments }) => {
  await transporter.sendMail({ from: 'info@offsidemachineshops.com', to, subject, html, attachments })
  // Log to Firestore: notifications/{id} with channel: 'email'
}
```

---

### 3.5 — Push Notifications (For App Users)

For people who use the ERP app on desktop or mobile — push notifications for critical alerts.

**Setup:** Firebase Cloud Messaging (FCM) — free, already in the Firebase project.

```ts
// When user logs in, save their FCM token to Firestore
const token = await getToken(messaging, { vapidKey: VITE_FCM_VAPID_KEY })
await updateDoc(doc(db, 'users', currentUser.id), { fcmToken: token })

// Server sends push:
await admin.messaging().send({
  token: userDoc.fcmToken,
  notification: { title: 'Payment Received', body: '₹2.1L from Suresh Industries' }
})
```

**Notification types:**
- Payment received (immediate)
- QC passed/failed (immediate)
- New lead assigned (immediate)
- Daily briefing (9am)
- Project delay alert (immediate)
- Low stock critical (immediate)

---

## Phase 4 — The Automation Rules Engine
> Estimated time: 3–4 days | Builds on Phase 1 + Phase 3

---

### 4.1 — Server-Side Event Bus

Move automation off the frontend (where it currently runs in `useEffect`) to the server.
This means automations fire even when no one has the app open.

**Create `server/lib/eventBus.ts`:**
```ts
type ERP_Event =
  | { type: 'LEAD_CREATED'; leadId: string }
  | { type: 'LEAD_STAGE_CHANGED'; leadId: string; from: LeadStage; to: LeadStage }
  | { type: 'QUOTE_APPROVED'; quoteId: string }
  | { type: 'PAYMENT_RECEIVED'; paymentId: string }
  | { type: 'DESIGN_APPROVED'; projectId: string }
  | { type: 'TASK_BLOCKED'; taskId: string; reason: string }
  | { type: 'QC_RESULT'; qcId: string; result: QCResult }
  | { type: 'PROJECT_DISPATCHED'; projectId: string }
  | { type: 'PO_CREATED'; poId: string }
  | { type: 'STOCK_BELOW_THRESHOLD'; itemId: string }

export const emit = async (event: ERP_Event) => {
  // 1. Log the event to Firestore
  await db.collection('eventLog').add({ ...event, timestamp: new Date() })
  // 2. Run all matching automation rules
  await runAutomations(event)
}
```

Firestore Cloud Functions trigger `emit()` whenever a document changes, so every database
write automatically fires the relevant automations.

---

### 4.2 — Scheduled Jobs (Cron)

All time-based automations run as server-side cron jobs. No frontend needed.

**Create `server/jobs/scheduler.ts`:**

```ts
import cron from 'node-cron'

// Daily 9:00am IST — Morning briefing to owner
cron.schedule('0 9 * * *', dailyBriefingJob, { timezone: 'Asia/Kolkata' })

// Every hour — Check overdue leads + send reminders
cron.schedule('0 * * * *', overdueLeadReminderJob)

// Every hour — Check overdue payments + send reminders
cron.schedule('30 * * * *', paymentReminderJob)

// Every day 8:00am — Project delay risk analysis (AI)
cron.schedule('0 8 * * *', projectRiskAnalysisJob, { timezone: 'Asia/Kolkata' })

// Every day 7:00am — Inventory forecast for active projects
cron.schedule('0 7 * * *', inventoryForecastJob, { timezone: 'Asia/Kolkata' })

// Every Monday 10:00am — Weekly P&L summary to owner
cron.schedule('0 10 * * 1', weeklyReportJob, { timezone: 'Asia/Kolkata' })

// Every day 10:00pm — Update all lead AI scores
cron.schedule('0 22 * * *', leadScoringJob)

// Every 6 hours — Check WA sequence next steps
cron.schedule('0 */6 * * *', waSequenceJob)

// Every day 6:00pm — Attendance reminder to floor workers
cron.schedule('0 18 * * *', attendanceReminderJob, { timezone: 'Asia/Kolkata' })
```

Each job is a separate file in `server/jobs/` — clean separation, easy to enable/disable.

---

### 4.3 — Hard Gate Enforcement (Server-Side)

Currently gates are checked only if a frontend button is clicked. Move all gate checks to
the server so they cannot be bypassed even via direct database writes.

**Firestore Security Rules (add to Phase 1.2 rules):**
```
// Cannot dispatch without QC pass + payment
match /dispatches/{id} {
  allow create: if
    get(/databases/$(database)/documents/qcChecks/$(request.resource.data.qcId)).data.result == 'pass'
    // Payment check via Cloud Function (Firestore Rules can't do aggregates)
}
```

**Cloud Function for complex gate checks:**
```ts
export const onDispatchCreate = onDocumentCreated('dispatches/{id}', async (event) => {
  const dispatch = event.data.data()
  const payments = await db.collection('payments')
    .where('projectId', '==', dispatch.projectId).get()
  const allPaid = payments.docs.every(p => p.data().status === 'received')
  if (!allPaid) {
    // Delete the dispatch record — gate violated
    await event.data.ref.delete()
    // Notify: "Dispatch blocked — payment not cleared"
    await notifyManagers(`Dispatch attempt blocked for ${dispatch.projectId} — payment pending`)
  }
})
```

---

### 4.4 — Configurable Automation Rules (No-Code UI)

The existing `AutomationRule` type is well-designed. Build a UI so Mayur can add/edit
automation rules without code changes.

**UI in `CRMAutomation.tsx` → extend to full Automation Studio:**

```
┌────────────────────────────────────────────────┐
│  New Automation Rule                           │
├────────────────────────────────────────────────┤
│  WHEN:  [Lead Stage Changes ▼]                 │
│  FROM:  [Any ▼]  TO: [Quote Sent ▼]           │
│                                                │
│  IF:    [Lead Value ▼] [Greater Than ▼] [5L]  │
│                                                │
│  THEN:                                         │
│  ✅ Send WhatsApp to [Assigned Person ▼]       │
│      Message: [High value quote sent. Personal │
│      follow-up required within 24h.]           │
│  ✅ Notify Manager                              │
│  ✅ Set Follow-up Date: [+1 day]               │
│                                                │
│  [Save Rule]                                   │
└────────────────────────────────────────────────┘
```

---

## Phase 5 — Missing Modules (From Proposal)
> Estimated time: 4–5 days

---

### 5.1 — PRD & ROI Module (Module 16)

A dedicated per-project profitability view — not just overall revenue.

**What to show per project:**

```
PRJ-41 — Suresh Industries — MS Structural Frame
═══════════════════════════════════════════════
QUOTED           ACTUAL (Live)       VARIANCE
Material: ₹1.8L  Material: ₹2.1L   +₹30K  ⚠️
Labour:   ₹0.9L  Labour:   ₹0.85L  -₹5K   ✅
Margin:   22%    Margin:   17.4%    -4.6%  🔴

POs raised:      ₹1.6L (3 POs)
MRs issued:      ₹0.5L (from stock)
Total cost so far: ₹2.1L

Revenue (expected): ₹3.4L
Net Profit (projected): ₹1.3L (38% — including stock cost)
ROI: 1.85x

AI Note: Labour underrun is offset by material overrun.
Main risk: 2 pending MRs not yet costed.
```

**New fields needed on `Project` type:**
```ts
actualMaterialCost: number     // sum of all PO items for this project
actualLabourCost: number       // manual entry or derived from task hours
```

**Where to build:** New `src/components/PRDView.tsx` + add "ROI" tab to `ReportsView.tsx`

---

### 5.2 — Workshop Mobile / PWA (Module 06)

Refer to Phase 6 in the previous plan. Summary:

1. **Setup:** Add `vite-plugin-pwa` + `manifest.json` → app is installable on Android
2. **FloorView:** Simple task list → one-tap status update → blocker report → MR form
3. **QC Mobile:** Checklist form with large toggles, photo upload option
4. **Responsive:** Collapsible sidebar, mobile-first grids for all views
5. **Offline:** `enableIndexedDbPersistence(db)` — one line, works automatically

---

### 5.3 — MOM (Minutes of Meeting) Recording

Required at Step 1 of the 13-step workflow. Cannot progress lead to next stage without it.

**Add to `Lead` type:**
```ts
mom: {
  recordedAt: string
  attendees: string[]
  requirements: string
  budgetDiscussed: number | null
  timeline: string
  nextAction: string
  recordedBy: string
} | null
```

**In `CRMView.tsx`:** Add "Record MOM" button on lead cards in `new` stage.
If MOM is null and user tries to move lead to `requirement_collected`, block and show:
"Please record the Minutes of Meeting before proceeding."

---

### 5.4 — Installation Confirmation Step

Add between Dispatch and Delivery in the workflow.

**New status on `Dispatch`:** `'blocked' | 'ready' | 'dispatched' | 'installed' | 'delivered'`

**New fields:**
```ts
installedAt: string | null
installationConfirmedBy: string | null
installationNotes: string | null
installationPhoto: string | null   // Firebase Storage URL
```

**In `DispatchView.tsx`:** After `dispatched`, show "Confirm Installation" button.
Floor worker on mobile can upload a photo from site as proof.
Only after installation confirmed can the status move to `delivered`.

**Auto-trigger:** When `installedAt` is set → send client feedback request WA message.

---

### 5.5 — Client Feedback Loop

Post-delivery feedback to close the workflow loop.

**How it works:**
1. After installation confirmed, system sends WA/email with a link:
   `app.systembrainoffside.com/feedback/PRJ-41/[token]`
2. Client opens a simple 3-question form (no login needed):
   - Quality: ⭐⭐⭐⭐⭐
   - Delivery timeliness: ⭐⭐⭐⭐⭐
   - Would you recommend us? Yes / No
   - Comments (optional)
3. Response saved to `feedbackResponses/{projectId}` in Firestore
4. If rating < 3: alert owner immediately via WhatsApp
5. If rating 5/5: auto-trigger Google Review request

**New type:**
```ts
interface FeedbackResponse {
  projectId: string
  client: string
  qualityRating: 1|2|3|4|5
  deliveryRating: 1|2|3|4|5
  wouldRecommend: boolean
  comments: string
  submittedAt: string
  token: string
}
```

**Where to build:** `src/pages/FeedbackPage.tsx` (public, no auth)

---

### 5.6 — Final Accounting / Close Win Step

Currently a lead is `approved` at quotation stage. "Close Win" should happen at project
completion — when delivered, all payments received, invoice paid.

**Add `closed_won` and `closed_lost` to `LeadStage`:**
```ts
export type LeadStage = 'new' | 'requirement_collected' | 'quote_sent' | 'approved' | 'closed_won' | 'closed_lost' | 'lost'
```

**Auto-trigger:** When last payment for a project is marked `received` AND dispatch is
`delivered` → auto-move the linked lead to `closed_won`, generate final P&L summary,
store on the project document.

---

## Phase 6 — Firebase + Tally + Bank Integrations
> Estimated time: 2–3 weeks | Do after Phases 1–5

---

### 6.1 — Firebase Storage (Photos + Documents)

For installation photos, QC photos, client documents.

```ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export const uploadPhoto = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
// Usage: uploadPhoto(photo, `projects/${projectId}/installation/photo1.jpg`)
```

**Use in:**
- Installation confirmation photo
- QC inspection photos
- Client document uploads (drawings, specifications)
- Marketing shoot raw footage reference

---

### 6.2 — Tally XML Export

Eliminates double data entry. Accountant imports this file into Tally every week.

**Format:** Tally XML (TallyPrime format — publicly documented)

**What to export:**
- Sales invoices → Tally Sales Voucher
- Payments received → Tally Receipt Voucher
- Purchase orders received → Tally Purchase Voucher
- Payments made to suppliers → Tally Payment Voucher

**GST-compliant invoice numbering:**
Change from `INV-2` to `OSMS/2025-26/0002` format:
```ts
const financialYear = () => {
  const now = new Date()
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  return `${year}-${String(year + 1).slice(2)}`
}
const invoiceNumber = `OSMS/${financialYear()}/${String(nextId).padStart(4, '0')}`
```

**Build:** `src/lib/tallyExport.ts` + "Export to Tally" button in `InvoicesView.tsx`

---

### 6.3 — Google Calendar Integration

Sync follow-ups, project deadlines, shoot dates, and interviews to Google Calendar.

**Setup:** Google Calendar API via OAuth2 (one-time setup per user).
The Gmail MCP is already connected to this environment — Calendar API uses the same credentials.

**What to sync:**
- Lead follow-up dates → Google Calendar event
- Project deadlines → Calendar event with reminder 3 days before
- Marketing shoot dates → Calendar event
- HR interview schedules → Calendar event with candidate details
- QC scheduled dates → Calendar event

**Each event includes:**
- Project/lead ID in description
- Direct link back to the ERP record
- Invites to assigned person

---

### 6.4 — Bank Statement Reconciliation

Auto-match bank transactions to pending payments in the ERP.

**How it works:**
1. Export bank statement as CSV (most Indian banks support this)
2. Upload CSV in `PaymentsView.tsx`
3. Server parses transactions and fuzzy-matches to pending payments by:
   - Amount
   - Date proximity
   - Party name in narration
4. Shows: "Found likely match: ₹2,10,000 credit on 15 Apr → PAY-12 (Suresh Industries). Confirm?"
5. One-click confirm → marks payment received

**No direct bank API needed** — CSV upload is sufficient and works with all banks.

---

## Phase 7 — Attendance, HR Automation & Salary
> Estimated time: 1 week

---

### 7.1 — Attendance Tracking

**Clock-in via Floor Mobile View:**
- Big "Clock In" / "Clock Out" buttons at top of FloorView
- Records timestamp, geolocation (optional)
- Auto-clock-out at midnight if worker forgot

**Attendance dashboard (admin only):**
- Who is in right now
- Late arrivals (expected 9am, arrived after)
- Absent today
- Monthly summary grid per worker

**Auto-reminder:** If a worker hasn't clocked in by 9:30am → WhatsApp to manager:
"Ramesh K has not clocked in today. Please check."

---

### 7.2 — Leave Management

Workers request leave via WhatsApp (send message to business number):
- "leave tomorrow" → system creates leave request, notifies manager
- Manager approves/rejects via WhatsApp reply ("approve" / "reject")
- Approved leaves auto-update attendance calendar
- No app login needed for leave requests

---

### 7.3 — Salary Calculation (Admin Only, Role-Gated)

**Based on:**
- Monthly base salary (set per user in `UserProfile`)
- Working days in month
- Days present (from attendance)
- Advance deductions (if any)
- Overtime (manual entry)

**Formula:**
```
Net Salary = (Base ÷ Working Days × Days Present) - Advances + Overtime
```

**Output:** Printable salary slip PDF per employee, per month.
Only `admin` role can see salary figures. "Sahil (Account)" role cannot see salary data.

---

## Phase 8 — Advanced AI Features (Phase 3 of Proposal)
> Estimated time: Ongoing | Requires clean historical data (6+ months)

---

### 8.1 — Price Intelligence

**Learns from every PO:**
- Tracks material rates over time (MS price in Jan vs Apr)
- Flags if a supplier quote is higher than market rate
- Suggests: "Last 3 POs for MS Pipe from Ratan Steel: avg ₹72/kg. Current quote: ₹81/kg. 12.5% above average. Consider negotiating or checking alternate supplier."

---

### 8.2 — Optimal Scheduling

**Given:** Active projects, task dependencies, team availability, machine availability
**AI Output:** Suggested production schedule that minimises delays and machine idle time

This is a constraint-satisfaction problem. Gemini can reason about it given the context.
For a shop with <10 concurrent projects, Gemini's reasoning is sufficient (no separate
scheduling algorithm needed).

---

### 8.3 — Client Health Score

Like a CRM health check per client (not just per lead).

**Factors:**
- Payment history (always on time / sometimes late / always late)
- Average project value trend (growing / stable / shrinking)
- Complaint/rework frequency
- Referrals given
- Communication responsiveness

**Output:** Score per client (A/B/C/D grade). A-grade clients get priority scheduling.
D-grade clients get additional payment gates enforced.

---

### 8.4 — Predictive Reordering

**Never stock out again:**
- Based on upcoming project pipeline + historical consumption rates
- System calculates: "At current project rate, MS Pipe will stock out in 18 days"
- Automatically raises draft PO 14 days before projected stockout
- Sends for manager approval — one tap to approve and send to supplier

---

### 8.5 — Win/Loss Learning

After each quote outcome (won or lost), Gemini updates its model understanding:
- "Lost 4 quotes to [competitor] when margin > 25% on SS projects"
- "Won 80% of MS structural quotes when response time < 24h"
- "Clients from [sector] have 90% advance payment compliance"

Feeds back into the Quotation Predictor (Phase 2.2) making it more accurate over time.

---

## Phase 9 — Client & Vendor Portals
> Estimated time: 1 week

---

### 9.1 — Client Project Tracking Portal

No login needed — share a link with the client.
URL: `yourapp.com/track/PRJ-41?token=abc123`

**What client sees:**
```
┌──────────────────────────────────────────────────┐
│  OFFSIDE MACHINE SHOPS LLP                       │
│  Your Project: Structural Frame for Bay 3        │
│──────────────────────────────────────────────────│
│  Status: IN PRODUCTION              62% Complete │
│  ████████████████░░░░░░░░░           62%         │
│  Expected Delivery: 28 April 2026                │
│                                                  │
│  MILESTONES:                                     │
│  ✅ Requirements confirmed   15 Apr              │
│  ✅ Design approved          17 Apr              │
│  ✅ Production started       18 Apr              │
│  ⏳ Quality inspection       ~25 Apr             │
│  ⏳ Dispatch                 ~27 Apr             │
│  ⏳ Delivery                 28 Apr              │
│                                                  │
│  PAYMENT STATUS:                                 │
│  ✅ Advance ₹1,70,000       Received             │
│  ⏳ Final ₹1,70,000         Due on delivery      │
│                                                  │
│  Questions? WhatsApp us: +91 76982 44742         │
└──────────────────────────────────────────────────┘
```

**Token security:** UUID generated per project, stored in Firestore.
Share token is revoked after project is delivered.

---

### 9.2 — Online Quote Approval

Instead of client calling to approve a quote, send them a link:
`yourapp.com/quote/Q-45?token=xyz789`

Client sees the full quotation and two buttons:
- **Approve Quote** → auto-moves quote to `approved`, triggers advance payment request WA
- **Request Changes** → text box for feedback → creates activity log on lead

This removes a human step from the workflow entirely.

---

### 9.3 — Vendor PO Confirmation Portal

`yourapp.com/vendor/PO-12?token=...`

Supplier sees:
- PO details and item list
- Buttons: "Confirm PO", "Request Change", "Cannot Fulfill"
- Delivery date picker if they need to change expected date
- On confirm → PO status updates to `confirmed` in Firestore, team notified

---

## Implementation Timeline

```
WEEK 1–2   │ Phase 0: Bug fixes
            │ Phase 1: Firebase setup + Firestore migration
            │ Phase 1: Login + role-based access

WEEK 3–4   │ Phase 2: Gemini AI integration
            │ Phase 2: Quotation predictor
            │ Phase 2: Daily briefing (WhatsApp 9am)
            │ Phase 3: WhatsApp Business API (Wati setup)
            │ Phase 3: Basic communication sequences (WA templates)

WEEK 5–6   │ Phase 4: Server-side event bus + cron jobs
            │ Phase 5: Missing modules (PRD/ROI, MOM, Installation, Feedback)
            │ Phase 6: Workshop Mobile PWA + FloorView

WEEK 7–8   │ Phase 3: Full communication map (all triggers)
            │ Phase 5: Client tracking portal + quote approval link
            │ Phase 6: Tally export + GST invoice numbers
            │ Phase 7: Attendance tracking

MONTH 3    │ Phase 6: Bank reconciliation
            │ Phase 6: Google Calendar sync
            │ Phase 7: Salary calculation + payslip PDF
            │ Phase 8: Price intelligence + predictive reordering

MONTH 4+   │ Phase 8: Advanced AI (scheduling, client health, win/loss learning)
            │ Phase 9: Vendor portal
            │ Phase 9: e-Invoice / IRP (government mandate)
```

---

## Technology Stack (Final)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19 + TypeScript | Already in place |
| Styling | Tailwind CSS v4 | Already in place |
| Charts | Recharts + D3 | Recharts in place; D3 for advanced |
| Animation | Framer Motion | Already in place |
| PDF | jsPDF + autotable | Already in place |
| AI | Google Gemini 2.0 Flash / 2.5 Pro | Package installed |
| Database | Firebase Firestore | Real-time, offline support, scalable |
| Auth | Firebase Authentication | Free, secure, easy |
| File Storage | Firebase Storage | Photos, PDFs, documents |
| Push Notifications | Firebase Cloud Messaging | Free, cross-platform |
| Backend | Node.js + Express | Already in place |
| Scheduling | node-cron | Simple, reliable |
| WhatsApp | Wati Business API | Indian vendor, affordable |
| Email | Nodemailer + Gmail SMTP / SendGrid | Simple setup |
| Mobile | PWA (vite-plugin-pwa) | Same code, installable |
| Offline | Firestore IndexedDB persistence | One config line |
| Hosting | Firebase Hosting | Free tier, fast CDN |
| Server hosting | Railway / Render (₹0 free tier) | Express server for cron + webhooks |

---

## Master Checklist

### Phase 0 — Bug Fixes (Before Anything)
- [ ] 0.1 Fix reset button localStorage key
- [ ] 0.2 Split inventory vs invoice ID counters
- [ ] 0.3 Fix MR counter (`mr` → `mrq`)
- [ ] 0.4 Fix dashboard "New Lead" button
- [ ] 0.5 Guard against duplicate task creation
- [ ] 0.6 Fix quote revision ID generation
- [ ] 0.7 Unify project creation code paths
- [ ] 0.8 Fix PDF footer line y-position
- [ ] 0.9 Fix placeholder client info in PDFs
- [ ] 0.10 Reduce auto-reminder interval

### Phase 1 — Cloud Foundation
- [ ] 1.1 Firebase project setup + `.env` config
- [ ] 1.2 Firestore schema + security rules
- [ ] 1.3 Migrate frontend from localStorage to Firestore
- [ ] 1.4 Login page + Firebase Auth + role-based access
- [ ] 1.5 Add `accountant` as 4th role (for Sahil)

### Phase 2 — AI Brain
- [ ] 2.1 `src/lib/ai.ts` — Gemini service layer
- [ ] 2.2 Quotation profit/loss predictor (inside QuotationForm)
- [ ] 2.3 Lead conversion score (shown on CRM lead cards)
- [ ] 2.4 Project delay risk predictor (daily cron + badge in ProjectsView)
- [ ] 2.5 Cash flow forecasting (30/60/90 day view in ReportsView)
- [ ] 2.6 Inventory demand forecasting (on project creation)
- [ ] 2.7 Daily 9am briefing to owner (WhatsApp + Push)

### Phase 3 — Communication Engine
- [ ] 3.1 Wati WhatsApp API setup + template approvals
- [ ] 3.2 Inbound WA webhook → auto lead creation
- [ ] 3.3 Full client communication sequence (all triggers)
- [ ] 3.4 Internal team notifications (all triggers)
- [ ] 3.5 Vendor / supplier communication
- [ ] 3.6 Email automation (SendGrid/Nodemailer)
- [ ] 3.7 Push notifications (Firebase Cloud Messaging)

### Phase 4 — Automation Engine
- [ ] 4.1 Server-side event bus (`server/lib/eventBus.ts`)
- [ ] 4.2 All cron jobs in `server/jobs/scheduler.ts`
- [ ] 4.3 Hard gates enforced via Firestore Cloud Functions
- [ ] 4.4 No-code automation rule builder UI

### Phase 5 — Missing Modules
- [ ] 5.1 PRD & ROI module (per-project profitability)
- [ ] 5.2 Workshop Mobile / PWA (Module 06)
- [ ] 5.3 MOM recording (Step 1 of 13-step workflow)
- [ ] 5.4 Installation confirmation step
- [ ] 5.5 Client feedback form (public, no login)
- [ ] 5.6 Close Win / Final Accounting step

### Phase 6 — Integrations
- [ ] 6.1 Firebase Storage (photos + documents)
- [ ] 6.2 Tally XML export + GST invoice numbering
- [ ] 6.3 Google Calendar sync
- [ ] 6.4 Bank statement CSV reconciliation

### Phase 7 — HR & Attendance
- [ ] 7.1 Attendance clock-in/out (via Floor mobile view)
- [ ] 7.2 Leave management via WhatsApp
- [ ] 7.3 Salary calculation + payslip PDF (admin only)

### Phase 8 — Advanced AI
- [ ] 8.1 Material price intelligence (track PO rate trends)
- [ ] 8.2 Optimal production scheduling (AI-assisted)
- [ ] 8.3 Client health scoring (A/B/C/D grade)
- [ ] 8.4 Predictive reordering (auto-draft PO before stockout)
- [ ] 8.5 Win/loss learning feedback loop

### Phase 9 — Portals
- [ ] 9.1 Client project tracking portal (public link)
- [ ] 9.2 Online quote approval (client taps Approve on phone)
- [ ] 9.3 Vendor PO confirmation portal
- [ ] 9.4 e-Invoice / IRP integration (government mandate)

---

## The End State (What "Done" Looks Like)

When all phases are complete, this is a typical day:

**6:59am** — System runs night analysis. Compares all project progress vs expected.

**7:00am** — Inventory forecast runs. Detects PRJ-44 will need 80kg MS pipe next week.
Draft PO auto-created and sent to manager for 1-tap approval.

**9:00am** — Mayur gets a WhatsApp message with full daily briefing. He reads it, replies
"approve PO" to the bot → PO is sent to supplier automatically.

**9:15am** — Ramesh (floor worker) opens the app on his phone (no browser, installed as app).
Sees 3 tasks for today. Marks Task T-42 as In Progress.

**10:00am** — A new WhatsApp message comes in from an unknown number.
System auto-creates lead, assigns to Rahul, sends Rahul a WA notification.
Welcome message sent to the prospect automatically.

**11:30am** — Rahul collects requirements. Fills MOM form in CRM. Lead stage moves forward.
System auto-creates a draft quotation.

**12:00pm** — Quote is filled. Before saving, AI risk panel shows: "Margin 18% — risk HIGH.
Similar projects averaged 22% cost overrun. Recommended price: ₹4.2L (currently ₹3.8L)."
Rahul adjusts and saves at ₹4.1L.

**2:00pm** — Quote sent to client. WhatsApp + Email with PDF auto-sent. Follow-up scheduled.

**3:00pm** — Suresh Industries' overdue payment (15 days). Third WA reminder auto-sent.
Mayur gets push notification: "Third reminder sent. Manual follow-up recommended."

**5:00pm** — QC passed for PRJ-39. System auto-sends WA to client: "Your order passed QC."
Dispatch can now proceed. DispatchView shows PRJ-39 as "Ready".

**6:00pm** — Floor workers get WA attendance reminder. Ramesh clock-out.

**6:30pm** — Client of PRJ-37 clicks the tracking link sent last week.
Sees: 75% complete, delivery in 3 days.

**Midnight** — System calculates cash flow forecast, updates AI insights, scores all leads.

**Nobody had to manually send a single message. Nobody had to remember anything.**
**The system ran the business.**
