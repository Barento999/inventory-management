import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SalesChart = ({ data, type = 'line', height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500">
        No data available
      </div>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
          formatter={(value) => `$${value.toFixed(2)}`}
        />
        <Legend />
        <DataComponent
          type="monotone"
          dataKey="sales"
          stroke="#3b82f6"
          fill={type === 'area' ? '#93c5fd' : undefined}
          name="Sales"
        />
        <DataComponent
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          fill={type === 'area' ? '#a7f3d0' : undefined}
          name="Revenue"
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export default SalesChart;
