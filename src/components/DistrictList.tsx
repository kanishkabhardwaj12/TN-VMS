import { District } from '../types';
import { formatNumber } from '../lib/utils';
import { ShieldCheck, Info } from 'lucide-react';

interface Props {
  districts: District[];
}

export default function DistrictList({ districts }: Props) {
  return (
    <div className="bg-white border border-[#141414]/10">
      <div className="p-6 border-b border-[#141414]/10 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest italic font-serif opacity-60 mb-1">Administrative View</h2>
            <h3 className="text-xl font-bold tracking-tight">Granular Stock Tracking</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-400 rounded-full" />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full" />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Healthy</span>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#141414]/5 text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">
              <th className="p-4 border-r border-b border-[#141414]/10">District Name</th>
              <th className="p-4 border-r border-b border-[#141414]/10">Population</th>
              <th className="p-4 border-r border-b border-[#141414]/10">Today Cases</th>
              <th className="p-4 border-r border-b border-[#141414]/10">Total Stock</th>
              <th className="p-4 border-r border-b border-[#141414]/10">Requirement</th>
              <th className="p-4 border-b border-[#141414]/10">Status</th>
            </tr>
          </thead>
          <tbody>
            {districts.map((district) => {
              const totalStock = district.vaccines.reduce((acc, v) => acc + v.stock, 0);
              const totalReq = district.vaccines.reduce((acc, v) => acc + v.requirement, 0);
              const stockRatio = totalStock / totalReq;

              return (
                <tr key={district.id} className="hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group">
                  <td className="p-4 border-r border-b border-[#141414]/10 font-bold tracking-tight">
                    {district.name}
                  </td>
                  <td className="p-4 border-r border-b border-[#141414]/10 font-mono text-xs opacity-60 group-hover:opacity-100">
                    {formatNumber(district.population)}
                  </td>
                  <td className="p-4 border-r border-b border-[#141414]/10 font-mono text-xs font-bold">
                    {district.casesToday}
                  </td>
                  <td className="p-4 border-r border-b border-[#141414]/10 font-mono text-xs">
                    {formatNumber(totalStock)}
                  </td>
                  <td className="p-4 border-r border-b border-[#141414]/10 font-mono text-xs opacity-60 group-hover:opacity-100">
                    {formatNumber(totalReq)}
                  </td>
                  <td className="p-4 border-b border-[#141414]/10">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-[#141414]/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            stockRatio < 0.8 ? 'bg-red-500' : stockRatio < 1.1 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(stockRatio * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${
                         stockRatio < 0.8 ? 'text-red-500 group-hover:text-red-400' : stockRatio < 1.1 ? 'text-orange-500 group-hover:text-orange-300' : 'text-emerald-500 group-hover:text-emerald-300'
                      }`}>
                        {Math.floor(stockRatio * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
