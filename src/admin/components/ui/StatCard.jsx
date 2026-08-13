import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export const StatCard = ({ title, value, growth, icon: Icon, chartData = [], prefix = "", subtitle = "" }) => {
  const isPositive = growth >= 0;
  
  // Default fallback sparkline if none provided
  const defaultData = [
    { v: 30 }, { v: 45 }, { v: 38 }, { v: 62 }, { v: 55 }, { v: 75 }, { v: isPositive ? 90 : 25 }
  ];
  const dataToRender = chartData.length > 0 ? chartData : defaultData;
  const dataKey = chartData.length > 0 ? Object.keys(chartData[0])[1] || "revenue" : "v";

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">{title}</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}
          </h2>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 shadow-2xs">
            <Icon className="w-6 h-6 stroke-[1.5]" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
            isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          }`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(growth)}%
          </span>
          <span className="text-xs text-slate-400">vs last period</span>
        </div>

        <div className="w-24 h-10 -mr-2 -mb-2 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataToRender} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10B981" : "#F43F5E"} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={isPositive ? "#10B981" : "#F43F5E"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={isPositive ? "#10B981" : "#F43F5E"}
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s+/g, "")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
