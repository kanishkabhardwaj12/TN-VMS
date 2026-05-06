import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Mock Data ---
const DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", 
  "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", 
  "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];

const VACCINE_TYPES = ["Covishield", "Covaxin", "Sputnik V", "Corbevax"];

const generateMockData = () => {
  return DISTRICTS.map(name => {
    const population = Math.floor(Math.random() * 2000000) + 500000;
    const casesToday = Math.floor(Math.random() * 100);
    const growthRate = (Math.random() * 0.2) - 0.05; // -5% to +15%
    
    const vaccines = VACCINE_TYPES.map(type => ({
      type,
      stock: Math.floor(Math.random() * 100000) + 10000,
      requirement: Math.floor(Math.random() * 50000) + 30000
    }));

    // Calculate Risk
    const totalStock = vaccines.reduce((acc, v) => acc + v.stock, 0);
    const totalReq = vaccines.reduce((acc, v) => acc + v.requirement, 0);
    const riskScore = (casesToday / 100) * 0.5 + (totalReq / totalStock) * 0.5;
    
    let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
    if (riskScore > 0.8) riskLevel = 'High';
    else if (riskScore > 0.5) riskLevel = 'Medium';

    return {
      id: name.toLowerCase().replace(/\s/g, '-'),
      name,
      population,
      casesToday,
      growthRate,
      riskLevel,
      riskScore,
      vaccines
    };
  });
};

const mockData = generateMockData();

// --- Server Setup ---
const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get("/api/districts", (req, res) => {
  res.json(mockData);
});

app.get("/api/districts/:id", (req, res) => {
  const district = mockData.find(d => d.id === req.params.id);
  if (!district) return res.status(404).send("Not found");
  res.json(district);
});

app.get("/api/predictive-insights", (req, res) => {
  const highRiskDistricts = mockData.filter(d => d.riskLevel === 'High').map(d => d.name);
  const totalRequirement = mockData.reduce((acc, d) => acc + d.vaccines.reduce((vAcc, v) => vAcc + v.requirement, 0), 0);
  
  res.json({
    summary: "Forecasting platform predicts a potential outbreak cluster in the Northern districts over the next 14 days.",
    highRiskDistricts,
    projectedTotalRequirement: totalRequirement,
    lastUpdated: new Date().toISOString()
  });
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// For local development in AI Studio
if (process.env.NODE_ENV !== "production") {
  setupVite().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  });
}

// Export for Vercel serverless function
export default app;
