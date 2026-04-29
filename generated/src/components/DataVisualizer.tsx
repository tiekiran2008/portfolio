import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Skill } from '../context/PortfolioContext';

interface DataVisualizerProps {
  skills: Skill[];
}

const COLORS = ['#00FFAB', '#00FFFF', '#8A2BE2', '#FF00FF', '#FFA500', '#FF4500'];

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ skills }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Aggregate skills by category
  const categoryCounts = skills.reduce((acc, skill) => {
    acc[skill.category] = (acc[skill.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(categoryCounts).map((key) => ({
    name: key,
    count: categoryCounts[key],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-[#05070A] border border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="text-[#00FFAB] font-mono text-sm mb-1">{label || payload[0]?.name}</p>
          <p className="text-white font-mono text-xs">
            Count: <span className="text-[#00FFFF]">{payload[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel p-6 sm:p-8 rounded-2xl border border-gray-800 bg-[#0a0f1c]/80 mt-16 w-full"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="text-2xl font-bold text-white tracking-wide">
          Skill Distribution
        </h3>
        <div className="flex bg-[#05070A] rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setChartType('bar')}
            className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${
              chartType === 'bar'
                ? 'bg-[#00FFAB]/20 text-[#00FFAB]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${
              chartType === 'pie'
                ? 'bg-[#00FFAB]/20 text-[#00FFAB]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
              />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f2937', opacity: 0.4 }} />
              <Bar dataKey="count" fill="#00FFAB" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-gray-300 text-xs font-mono">{value}</span>}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
