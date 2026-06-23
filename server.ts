import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { users, projects } from "./src/db/schema.ts";
import { eq, and } from "drizzle-orm";
import { generateFeasibilityReport } from "./src/utils/finance.ts";
import { getGemini } from "./src/lib/gemini.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth synchronization endpoint
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const user = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com", "user");
      res.json({ user });
    } catch (error: any) {
      console.error("Error in auth sync:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Get user projects
  app.get("/api/projects", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      
      const userProjects = await db.select().from(projects).where(eq(projects.userId, localUser.id));
      res.json(userProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create project
  app.post("/api/projects", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      
      const [newProj] = await db.insert(projects).values({
        userId: localUser.id,
        name: req.body.name || "Untitled Project",
        description: req.body.description || "",
        investmentCost: Number(req.body.investmentCost ?? 100000),
        monthlyRevenue: Number(req.body.monthlyRevenue ?? 15000),
        growthRate: Number(req.body.growthRate ?? 5.0),
        inflationRate: Number(req.body.inflationRate ?? 2.5),
        maintenanceCost: Number(req.body.maintenanceCost ?? 2000),
        operatingCost: Number(req.body.operatingCost ?? 4000),
        taxRate: Number(req.body.taxRate ?? 20.0),
        residualValue: Number(req.body.residualValue ?? 15000),
        depreciationYears: Number(req.body.depreciationYears ?? 5),
        discountRate: Number(req.body.discountRate ?? 10.0),
        analysisYears: Number(req.body.analysisYears ?? 5),
      }).returning();
      
      res.status(201).json(newProj);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update project
  app.put("/api/projects/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      const id = Number(req.params.id);
      
      const [updatedProj] = await db.update(projects).set({
        name: req.body.name,
        description: req.body.description,
        investmentCost: Number(req.body.investmentCost),
        monthlyRevenue: Number(req.body.monthlyRevenue),
        growthRate: Number(req.body.growthRate),
        inflationRate: Number(req.body.inflationRate),
        maintenanceCost: Number(req.body.maintenanceCost),
        operatingCost: Number(req.body.operatingCost),
        taxRate: Number(req.body.taxRate),
        residualValue: Number(req.body.residualValue),
        depreciationYears: Number(req.body.depreciationYears),
        discountRate: Number(req.body.discountRate),
        analysisYears: Number(req.body.analysisYears),
        updatedAt: new Date(),
      }).where(and(eq(projects.id, id), eq(projects.userId, localUser.id))).returning();
      
      if (!updatedProj) {
        return res.status(404).json({ error: "Project not found or unauthorized" });
      }
      res.json(updatedProj);
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      const id = Number(req.params.id);
      
      const result = await db.delete(projects)
        .where(and(eq(projects.id, id), eq(projects.userId, localUser.id)))
        .returning();
        
      if (result.length === 0) {
        return res.status(404).json({ error: "Project not found or unauthorized" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Duplicate project
  app.post("/api/projects/:id/duplicate", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      const id = Number(req.params.id);
      
      const [projToDup] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, localUser.id)));
      if (!projToDup) {
        return res.status(404).json({ error: "Project not found or unauthorized" });
      }
      
      const [newProj] = await db.insert(projects).values({
        userId: localUser.id,
        name: `${projToDup.name} (Copy)`,
        description: projToDup.description || "",
        investmentCost: projToDup.investmentCost,
        monthlyRevenue: projToDup.monthlyRevenue,
        growthRate: projToDup.growthRate,
        inflationRate: projToDup.inflationRate,
        maintenanceCost: projToDup.maintenanceCost,
        operatingCost: projToDup.operatingCost,
        taxRate: projToDup.taxRate,
        residualValue: projToDup.residualValue,
        depreciationYears: projToDup.depreciationYears,
        discountRate: projToDup.discountRate,
        analysisYears: projToDup.analysisYears,
      }).returning();
      
      res.status(201).json(newProj);
    } catch (error: any) {
      console.error("Error duplicating project:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Project insights (AI Insights from Gemini)
  app.get("/api/projects/:id/insights", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      const id = Number(req.params.id);
      
      const [proj] = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, localUser.id)));
      if (!proj) {
        return res.status(404).json({ error: "Project not found or unauthorized" });
      }
      
      const feasibilityReport = generateFeasibilityReport({
        investmentCost: proj.investmentCost,
        monthlyRevenue: proj.monthlyRevenue,
        growthRate: proj.growthRate,
        inflationRate: proj.inflationRate,
        maintenanceCost: proj.maintenanceCost,
        operatingCost: proj.operatingCost,
        taxRate: proj.taxRate,
        residualValue: proj.residualValue,
        depreciationYears: proj.depreciationYears,
        discountRate: proj.discountRate,
        analysisYears: proj.analysisYears,
      });

      // Secure pre-calculated static insights fallback to satisfy resilience guidelines
      const fallbackInsights = {
        feasibilityStatus: feasibilityReport.metrics.isFeasible ? "Feasible" : "Unfeasible or Marginal",
        analysisText: `Based on quantitative metrics calculated by the FinanceFeasibility Engine, the project "${proj.name}" is economically ${feasibilityReport.metrics.isFeasible ? 'feasible' : 'marginal / unfeasible'}. Net Present Value (NPV) is $${feasibilityReport.metrics.npv.toLocaleString(undefined, {maximumFractionDigits:2})} at a hurdle rate of ${proj.discountRate}%. The Internal Rate of Return (IRR) is ${feasibilityReport.metrics.irr ? feasibilityReport.metrics.irr.toFixed(2) + '%' : 'N/A'}, which ${feasibilityReport.metrics.irr && feasibilityReport.metrics.irr > proj.discountRate ? 'exceeds' : 'lags'} our cost of capital benchmark. The initial outlay break-even term is projected to complete in ${feasibilityReport.metrics.paybackFormatted}.`,
        strengths: [
          `Generates positive NPV of $${feasibilityReport.metrics.npv.toLocaleString(undefined, {maximumFractionDigits:2})}, adding net economic value above hurdle costs.`,
          `Return On Investment (ROI) stands at ${feasibilityReport.metrics.roi.toFixed(2)}%, proving efficient capital allocation.`,
          `Residual terminal salvage of $${proj.residualValue.toLocaleString()} improves ultimate project liquidity profile.`
        ],
        risks: [
          `Requires sustained annual growth trajectory of ${proj.growthRate}% to meet baseline parameters.`,
          `Exposed to operating inflation risk at ${proj.inflationRate}% per annum, which will compound and margin-squeeze unless hedged.`,
          `Depreciation schedule limits tax shield durability to ${proj.depreciationYears} years.`
        ],
        recommendations: [
          `Build operational cost efficiencies to buffer the annual ${proj.inflationRate}% expense inflation.`,
          "Maximize capacity utilization in year 1 to lock in the positive cash flow slope before compounding costs.",
          "Explore localized corporate tax concessions to accelerate initial year amortization shield duration."
        ]
      };

      try {
        const gemini = getGemini();
        const aiPrompt = `You are a high-level CFO and expert financial consultancy AI agent.
Analyze the following investment project details and quantitative feasibility output:

Project Name: "${proj.name}"
Description: "${proj.description || ''}"

Parameters:
- Initial Investment Cost: $${proj.investmentCost.toLocaleString()}
- Monthly Gross Revenue: $${proj.monthlyRevenue.toLocaleString()} (Annual Baseline: $${(proj.monthlyRevenue * 12).toLocaleString()})
- Target Growth Rate: ${proj.growthRate}% per year
- Inflation Margin Drift: ${proj.inflationRate}% per year
- Monthly Operating Expenses: $${proj.operatingCost.toLocaleString()}
- Maintenance Expenses: $${proj.maintenanceCost.toLocaleString()} per year
- Corporate Tax Bracket: ${proj.taxRate}%
- Residual Savage Terminal Value: $${proj.residualValue.toLocaleString()} at Year ${proj.analysisYears}
- Depreciation Life: ${proj.depreciationYears} Years
- WACC/Discount Hurdle Rate: ${proj.discountRate}%

Engine Calculations:
- Net Present Value (NPV): $${feasibilityReport.metrics.npv.toLocaleString(undefined, {maximumFractionDigits: 2})}
- Internal Rate of Return (IRR): ${feasibilityReport.metrics.irr ? feasibilityReport.metrics.irr.toFixed(2) + '%' : 'N/A'}
- ROI: ${feasibilityReport.metrics.roi.toFixed(2)}%
- Payback Period: ${feasibilityReport.metrics.paybackFormatted}
- Verdict conclusion: Project is ${feasibilityReport.metrics.isFeasible ? 'FEASIBLE' : 'NOT FEASIBLE Or MARGINAL'} compared to hurdle rate of ${proj.discountRate}%.

Generate a professional strategic investment review. Your evaluation MUST quote figures (NPV, IRR) directly.
You must return only a valid JSON block containing:
1. "feasibilityStatus": Verdict must be one of "Feasible", "Unfeasible", "Marginal"
2. "analysisText": High-level analytical review outlining WACC, cash flow timing, and structural economic feasibility.
3. "strengths": Array of 3-4 key investment advantages (e.g. cash profile, depreciation shields, salvage value).
4. "risks": Array of 3-4 vulnerabilities (e.g. inflation drift, tax drag, utilization rate).
5. "recommendations": Array of 3-4 expert financial advices.

Respond strictly inside a JSON block with these exact keys. Do not explain extra things. No markdown formatting.
{
  "feasibilityStatus": "Feasible" | "Unfeasible" | "Marginal",
  "analysisText": "detailed string narrative",
  "strengths": ["string", "string", ...],
  "risks": ["string", "string", ...],
  "recommendations": ["string", "string", ...]
}`;

        const aiResult = await gemini.models.generateContent({
          model: "gemini-3.5-flash",
          contents: aiPrompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        const text = aiResult.text;
        if (text) {
          const parsed = JSON.parse(text.trim());
          return res.json(parsed);
        } else {
          return res.json(fallbackInsights);
        }
      } catch (geminiError) {
        console.warn("Gemini service failed or timed out. Falling back to structured, deterministic evaluation:", geminiError);
        return res.json(fallbackInsights);
      }
    } catch (error: any) {
      console.error("Error in insights endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Analytics endpoint
  app.get("/api/admin/analytics", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      
      // Admin verification
      if (localUser.role !== "admin") {
        // Automatically promote first registering user to admin for playground accessibility!
        const allUsersList = await db.select().from(users);
        if (allUsersList.length <= 1) {
          await db.update(users).set({ role: "admin" }).where(eq(users.id, localUser.id));
          localUser.role = "admin";
        } else {
          return res.status(403).json({ error: "Access Denied: Admin authorization required." });
        }
      }
      
      const allProjects = await db.select().from(projects);
      const allUsers = await db.select().from(users);
      
      let totalNPV = 0;
      let totalROI = 0;
      let validIRRCount = 0;
      let sumIRR = 0;
      let feasibleCount = 0;

      for (const p of allProjects) {
        const rep = generateFeasibilityReport({
          investmentCost: p.investmentCost,
          monthlyRevenue: p.monthlyRevenue,
          growthRate: p.growthRate,
          inflationRate: p.inflationRate,
          maintenanceCost: p.maintenanceCost,
          operatingCost: p.operatingCost,
          taxRate: p.taxRate,
          residualValue: p.residualValue,
          depreciationYears: p.depreciationYears,
          discountRate: p.discountRate,
          analysisYears: p.analysisYears,
        });

        totalNPV += rep.metrics.npv;
        totalROI += rep.metrics.roi;
        if (rep.metrics.irr !== null) {
          sumIRR += rep.metrics.irr;
          validIRRCount++;
        }
        if (rep.metrics.isFeasible) {
          feasibleCount++;
        }
      }

      res.json({
        totalProjects: allProjects.length,
        totalUsers: allUsers.length,
        averageROI: allProjects.length > 0 ? (totalROI / allProjects.length) : 0,
        averageIRR: validIRRCount > 0 ? (sumIRR / validIRRCount) : 0,
        averageNPV: allProjects.length > 0 ? (totalNPV / allProjects.length) : 0,
        feasibleRate: allProjects.length > 0 ? (feasibleCount / allProjects.length * 100) : 0,
        projects: allProjects.map(p => ({
          id: p.id,
          name: p.name,
          userEmail: allUsers.find(u => u.id === p.userId)?.email || "Unknown User",
          investmentCost: p.investmentCost,
          createdAt: p.createdAt
        })),
        users: allUsers.map(u => ({
          id: u.id,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt
        }))
      });
    } catch (error: any) {
      console.error("Admin Analytics error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Make core user an admin directly helper
  app.post("/api/admin/make-admin", requireAuth, async (req: AuthRequest, res) => {
    try {
      const fbUser = req.user!;
      const localUser = await getOrCreateUser(fbUser.uid, fbUser.email || "no-email@user.com");
      await db.update(users).set({ role: "admin" }).where(eq(users.id, localUser.id));
      res.json({ message: "Successfully promoted current user to Admin" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Client static assets serving and SPA fallback router
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(distPath, "index.html"));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinanceFeasibility full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
