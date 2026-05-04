import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardMetrics } from '../api/dashboardApi';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981'];

const statusLabel: Record<string, string> = {
  por_hacer: 'Por hacer',
  en_progreso: 'En progreso',
  review: 'Review',
  bloqueado: 'Bloqueado',
  listo: 'Listo',
};

interface Props { data: DashboardMetrics['byStatus'] }

export function DonutChartWidget({ data }: Props) {
  const formatted = data.map((d) => ({ ...d, name: statusLabel[d.status] ?? d.status }));

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">Distribución por estado</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={formatted} dataKey="count" nameKey="name" innerRadius={60} outerRadius={100}>
            {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
