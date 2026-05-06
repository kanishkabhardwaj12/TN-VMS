import { District } from '../types';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { formatNumber, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface Props {
  districts: District[];
}

export default function Dashboard({ districts }: Props) {
  const totalPop = districts.reduce((acc, d) => acc + d.population, 0);
  const totalCases = districts.reduce((acc, d) => acc + d.casesToday, 0);
  const totalStock = districts.reduce((acc, d) => acc + d.vaccines.reduce((vAcc, v) => vAcc + v.stock, 0), 0);
  
  const riskGroups = [
    { name: 'High Risk', value: districts.filter(d => d.riskLevel === 'High').length, color: '#ef4444' },
    { name: 'Medium Risk', value: districts.filter(d => d.riskLevel === 'Medium').length, color: '#f97316' },
    { name: 'Low Risk', value: districts.filter(d => d.riskLevel === 'Low').length, color: '#10b981' },
  ];

  const topDistrictsByCases = [...districts].sort((a, b) => b.casesToday - a.casesToday).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Population', value: formatNumber(totalPop), icon: Users, trend: '+2.1%', up: true },
          { label: 'Total Vaccinations', value: formatNumber(totalStock), icon: ShieldCheck, trend: '+5.4k Today', up: true },
          { label: 'Active Cases', value: totalCases, icon: Activity, trend: '-12%', up: false },
          { label: 'Oxygen Reserves', value: '4.2k KL', icon: AlertTriangle, trend: 'Stable', up: true },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="p-6 bg-white border border-[#141414]/10 flex flex-col justify-between group hover:border-[#141414] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#141414]/5 rounded group-hover:bg-[#141414] group-hover:text-[#E4E3E0] transition-colors">
                <stat.icon size={20} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-mono px-2 py-0.5 rounded",
                stat.up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}>
                {stat.up ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold font-mono tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cases Chart */}
        <div className="lg:col-span-2 p-8 bg-white border border-[#141414]/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest italic font-serif opacity-60 mb-1">Statewide Metrics</h2>
              <h3 className="text-xl font-bold tracking-tight">Active Cases by Region</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-[#141414] text-white text-xs uppercase font-bold tracking-widest">Bar</button>
              <button className="px-3 py-1 border border-[#141414]/20 text-xs uppercase font-bold tracking-widest opacity-40">Line</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDistrictsByCases}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#141414', opacity: 0.4 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#141414] text-[#E4E3E0] p-3 text-xs font-mono border-none shadow-xl">
                          <p className="uppercase opacity-50 mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg">Cases: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="casesToday" radius={[2, 2, 0, 0]}>
                  {topDistrictsByCases.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.riskLevel === 'High' ? '#ef4444' : entry.riskLevel === 'Medium' ? '#f97316' : '#141414'} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Breakdown */}
        <div className="p-8 bg-white border border-[#141414]/10">
          <h2 className="text-sm font-bold uppercase tracking-widest italic font-serif opacity-60 mb-1">Stock Readiness</h2>
          <h3 className="text-xl font-bold tracking-tight mb-8">Risk Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskGroups}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {riskGroups.map(group => (
              <div key={group.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                  <span className="text-xs uppercase font-bold tracking-widest opacity-60">{group.name}</span>
                </div>
                <span className="font-mono font-bold">{group.value} Districts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

