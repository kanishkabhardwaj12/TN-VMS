import { useState, useEffect } from 'react';
import { District, PredictiveInsights } from '../types';
import { Sparkles, TrendingUp, AlertCircle, FileText, BrainCircuit } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  insights: PredictiveInsights | null;
  districts: District[];
}

export default function PredictiveDashboard({ insights, districts }: Props) {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // Sample historical data for chart
  const historyData = [
    { name: 'Day -15', cases: 420 },
    { name: 'Day -10', cases: 450 },
    { name: 'Day -5', cases: 530 },
    { name: 'Today', cases: 610 },
    { name: 'Day +5', cases: 750, isFuture: true },
    { name: 'Day +10', cases: 920, isFuture: true },
    { name: 'Day +15', cases: 1100, isFuture: true },
  ];

  const generateAIAnalysis = async () => {
    if (districts.length === 0) return;
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const highRisk = districts.filter(d => d.riskLevel === 'High').map(d => d.name).join(', ');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As an epidemiologist for the Tamil Nadu Health Department, analyze this situation: 
        Statewide cases are at ${districts.reduce((a, b) => a + b.casesToday, 0)} today. 
        High risk districts: ${highRisk}. 
        Total vaccine stock: ${districts.reduce((a, b) => a + b.vaccines.reduce((acc, v) => acc + v.stock, 0), 0)}.
        Provide 3 specific, data-driven recommendations for the upcoming week. Use a professional, slightly clinical tone.`
      });
      setAiAnalysis(response.text || "Unable to generate analysis at this time.");
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysis("Analysis system offline. Please check connectivity.");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (districts.length > 0 && !aiAnalysis) {
      generateAIAnalysis();
    }
  }, [districts]);

  return (
    <div className="space-y-8">
      {/* AI Analysis Card */}
      <div className="bg-[#141414] text-[#E4E3E0] p-1 border border-white/10 overflow-hidden">
        <div className="p-8 border border-white/5 relative">
          <div className="absolute top-8 right-8 animate-pulse text-emerald-400">
            <BrainCircuit size={40} strokeWidth={1} />
          </div>
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-emerald-400" size={18} />
            <h2 className="text-xs uppercase tracking-[0.3em] font-bold opacity-60">Deep Intelligence Advisory</h2>
          </div>

          <div className="max-w-3xl">
            <h3 className="text-3xl font-bold tracking-tight mb-4 leading-tight italic font-serif">
              Emergent Epidemic Pulse & <br/>Resource Forecasting
            </h3>
            
            {analyzing ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-white/10 animate-pulse w-full" />
                <div className="h-4 bg-white/10 animate-pulse w-5/6" />
                <div className="h-4 bg-white/10 animate-pulse w-4/6" />
              </div>
            ) : (
              <div className="text-emerald-400/90 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            )}
          </div>

          <button 
            onClick={generateAIAnalysis}
            disabled={analyzing}
            className="mt-8 flex items-center gap-2 text-xs uppercase font-bold tracking-widest border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {analyzing ? 'Recalculating...' : 'Refresh Intelligence'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Forecast Chart */}
        <div className="bg-white border border-[#141414]/10 p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-[#141414] opacity-40" />
            <div>
              <h2 className="text-xs uppercase tracking-widest font-bold opacity-40">15-Day Projection</h2>
              <p className="text-lg font-bold tracking-tight">Case Incident Trajectory</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" strokeOpacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#141414', opacity: 0.4 }} 
                />
                <YAxis hide />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#141414] text-[#E4E3E0] p-4 text-xs font-mono shadow-2xl">
                          <p className="opacity-50 uppercase mb-2">{data.name}</p>
                          <p className="text-xl font-bold">{data.cases} Cases</p>
                          {data.isFuture && <p className="text-[10px] text-emerald-400 mt-2 tracking-widest uppercase">Predicted</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="#141414" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCases)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-red-50 border border-red-100 flex items-start gap-4">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <div>
              <p className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Critical Forecast Warning</p>
              <p className="text-xs text-red-700 leading-relaxed font-medium">
                MLR model suggests a 45% increase in cases within Western districts. Current stock levels may be insufficient by Day +12.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Map/Stats */}
        <div className="space-y-6">
          <div className="bg-white border border-[#141414]/10 p-8">
            <h2 className="text-xs uppercase tracking-widest font-bold opacity-40 mb-1">Impact Analysis</h2>
            <h3 className="text-lg font-bold tracking-tight mb-6">Logistics Optimization</h3>
            
            <div className="space-y-4">
              {[
                { label: 'Estimated Oxygen Demand', value: '+14.2%', trend: 'up' },
                { label: 'Vaccine Re-allocation Need', value: '82k doses', trend: 'up' },
                { label: 'Hospital Bed Utilization', value: '68%', trend: 'down' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center p-4 border border-[#141414]/5 hover:border-[#141414]/20 transition-colors">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className={cn(
                    "font-mono font-bold px-3 py-1 text-xs",
                    item.trend === 'up' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                  )}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-8 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-emerald-900 tracking-tight">Generate Full Report</h3>
              <p className="text-xs text-emerald-700 opacity-80 mt-1 uppercase tracking-widest font-bold">PDF • CSV • EXCEL</p>
            </div>
            <button className="p-4 bg-emerald-900 text-white rounded hover:bg-emerald-800 transition-colors">
              <FileText size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

