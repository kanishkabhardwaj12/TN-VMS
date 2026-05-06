import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

app.use(express.json());

// API Routes
app.get(["/api/districts", "/districts"], (req, res) => {
  res.json(mockData);
});

app.get(["/api/districts/:id", "/districts/:id"], (req, res) => {
  const district = mockData.find(d => d.id === req.params.id);
  if (!district) return res.status(404).send("Not found");
  res.json(district);
});

app.get(["/api/predictive-insights", "/predictive-insights"], (req, res) => {
  const highRiskDistricts = mockData.filter(d => d.riskLevel === 'High').map(d => d.name);
  const totalRequirement = mockData.reduce((acc, d) => acc + d.vaccines.reduce((vAcc, v) => vAcc + v.requirement, 0), 0);
  
  res.json({
    summary: "Forecasting platform predicts a potential outbreak cluster in the Northern districts over the next 14 days.",
    highRiskDistricts,
    projectedTotalRequirement: totalRequirement,
    lastUpdated: new Date().toISOString()
  });
});

app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", env: !!process.env.GEMINI_API_KEY, path: req.path });
});

app.post(["/api/ai-analyze", "/ai-analyze"], async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.error("Missing Gemini API Key in Environment Variables");
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on Vercel. Please add it to your project environment variables." });
    }

    const { districts } = req.body;
    if (!districts) return res.status(400).json({ error: "Missing districts data" });

    const genAI = new GoogleGenerativeAI(key);
    const highRisk = districts.filter((d: any) => d.riskLevel === 'High').map((d: any) => d.name).join(', ');
    const totalCases = districts.reduce((a: number, b: any) => a + b.casesToday, 0);
    const totalStock = districts.reduce((a: number, b: any) => a + b.vaccines.reduce((acc: number, v: any) => acc + v.stock, 0), 0);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `As an epidemiologist for the Tamil Nadu Health Department, analyze this situation: 
    Statewide cases are at ${totalCases} today. 
    High risk districts: ${highRisk}. 
    Total vaccine stock: ${totalStock}.
    Provide 3 specific, data-driven recommendations for the upcoming week. Use a professional, slightly clinical tone. Keep it concise.`;

    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    // Return specific error message for 403 or 400
    res.status(500).json({ 
      error: "AI Generation failed", 
      details: error?.message || "Unknown error"
    });
  }
});

export default app;
