import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 5175;

  app.use(express.json());

  // --- CRM Mock Data & Logic ---
  let leads = [
    { id: "L1", name: "Rahul Sharma", company: "Sharma Exports", phone: "+91 98765 43210", status: "new", assignedTo: null, source: "WhatsApp", created: new Date().toISOString() },
    { id: "L2", name: "Anjali Gupta", company: "Gupta Textiles", phone: "+91 87654 32109", status: "contacted", assignedTo: "A1", source: "Facebook", created: new Date().toISOString() },
  ];

  let agents = [
    { id: "A1", name: "Amit Kumar", role: "sales", active: true, leadCount: 5 },
    { id: "A2", name: "Suresh Raina", role: "sales", active: true, leadCount: 3 },
  ];

  // Lead Assignment Logic (Round Robin Prototype)
  let lastAssignedIndex = -1;

  function assignLead(leadId: string) {
    const activeAgents = agents.filter(a => a.active);
    if (activeAgents.length === 0) return null;

    lastAssignedIndex = (lastAssignedIndex + 1) % activeAgents.length;
    const agent = activeAgents[lastAssignedIndex];
    
    const leadIndex = leads.findIndex(l => l.id === leadId);
    if (leadIndex !== -1) {
      leads[leadIndex].assignedTo = agent.id;
      agent.leadCount++;
    }
    return agent;
  }

  // --- API Routes ---
  app.get("/api/crm/leads", (req, res) => {
    res.json(leads);
  });

  app.post("/api/crm/leads/assign", (req, res) => {
    const { leadId } = req.body;
    const agent = assignLead(leadId);
    if (agent) {
      res.json({ success: true, assignedTo: agent });
    } else {
      res.status(400).json({ success: false, message: "No active agents available" });
    }
  });

  app.get("/api/crm/agents", (req, res) => {
    res.json(agents);
  });

  // --- Vite Middleware ---
  console.log("NODE_ENV:", process.env.NODE_ENV);
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback to index.html for SPA routing
    app.get("*", async (req, res) => {
      console.log("SPA fallback hit:", req.path);
      try {
        const indexPath = path.join(__dirname, "index.html");
        console.log("Loading:", indexPath);
        res.sendFile(indexPath);
      } catch (err) {
        console.error("Error:", err);
        res.status(404).send("Not found");
      }
    });
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
