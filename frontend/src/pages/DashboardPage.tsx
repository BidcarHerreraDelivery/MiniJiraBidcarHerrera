import { useState } from 'react';
import { useDashboardMetrics } from '../features/dashboard/hooks/useDashboardMetrics';
import { BarChartWidget } from '../features/dashboard/components/BarChartWidget';
import { DonutChartWidget } from '../features/dashboard/components/DonutChartWidget';

export function DashboardPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data, isLoading } = useDashboardMetrics(from || undefined, to || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-3 items-center">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          <span className="text-sm text-gray-400">—</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1 text-sm" />
        </div>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-500">Cargando métricas…</p>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChartWidget data={data.createdVsClosed} />
          <DonutChartWidget data={data.byStatus} />
        </div>
      ) : null}
    </div>
  );
}
