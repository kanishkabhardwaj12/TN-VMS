import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  TrendingUp, 
  ShieldAlert, 
  Search, 
  Menu, 
  X,
  Bell,
  User,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import DistrictList from './components/DistrictList';
import PredictiveDashboard from './components/PredictiveDashboard';
import { cn } from './lib/utils';
import { District, PredictiveInsights } from './types';

const NAVIGATION = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'districts', name: 'District Analysis', icon: MapIcon },
  { id: 'predictive', name: 'AI Forecasting', icon: TrendingUp },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [districts, setDistricts] = useState<District[]>([]);
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [distRes, insightRes] = await Promise.all([
          fetch('/api/districts'),
          fetch('/api/predictive-insights')
        ]);
        const distData = await distRes.json();
        const insightData = await insightRes.json();
        setDistricts(distData);
        setInsights(insightData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full bg-[#141414] text-[#E4E3E0] transition-all duration-300 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#E4E3E0]/10">
          <div className={cn("flex items-center gap-3 overflow-hidden", !isSidebarOpen && "hidden")}>
            <div className="w-8 h-8 bg-[#E4E3E0] flex items-center justify-center rounded">
              <Database className="text-[#141414] w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-lg whitespace-nowrap">TN VMS</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#E4E3E0]/10 rounded transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {NAVIGATION.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded transition-all group",
                activeTab === item.id 
                  ? "bg-[#E4E3E0] text-[#141414]" 
                  : "hover:bg-[#E4E3E0]/10 text-[#E4E3E0]/60 hover:text-[#E4E3E0]"
              )}
            >
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
              {isSidebarOpen && (
                <span className="font-medium tracking-wide">{item.name}</span>
              )}
              {!isSidebarOpen && (
                <div className="absolute left-16 bg-[#141414] text-[#E4E3E0] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#E4E3E0]/20">
                  {item.name}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-[#E4E3E0]/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-[#141414] font-bold">
              HK
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-medium text-sm">Health Officer</p>
                <p className="text-xs text-[#E4E3E0]/40 truncate">State Admin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 h-16 bg-[#E4E3E0]/80 backdrop-blur-md border-b border-[#141414]/10 px-8 flex items-center justify-between z-40">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">
              {NAVIGATION.find(n => n.id === activeTab)?.name}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search districts..." 
                className="bg-transparent border border-[#141414]/10 rounded-none px-10 py-1.5 text-sm focus:outline-none focus:border-[#141414] w-64 transition-colors"
              />
            </div>
            <button className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[70vh] gap-4"
              >
                <div className="w-12 h-12 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-mono text-sm uppercase tracking-widest opacity-50">Initializing System...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && <Dashboard districts={districts} />}
                {activeTab === 'districts' && <DistrictList districts={districts} />}
                {activeTab === 'predictive' && <PredictiveDashboard insights={insights} districts={districts} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
