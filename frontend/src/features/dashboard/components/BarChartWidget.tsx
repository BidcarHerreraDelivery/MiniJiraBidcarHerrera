import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardMetrics } from '../api/dashboardApi';

interface Props { data: DashboardMetrics['createdVsClosed'] }

export function BarChartWidget({ data }: Props) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">Tickets creados vs. cerrados/archivados</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="created" name="Creados" fill="#3b82f6" />
          <Bar dataKey="closed" name="Cerrados/Archivados" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
