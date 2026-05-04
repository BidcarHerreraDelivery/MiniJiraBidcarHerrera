import { useFilterStore } from '../store/filterStore';
import { ticketsApi } from '../api/ticketsApi';

export function ExportButton() {
  const filters = useFilterStore((s) => s.filters);

  const download = async (type: 'csv' | 'pdf') => {
    const res = type === 'csv'
      ? await ticketsApi.exportCsv(filters)
      : await ticketsApi.exportPdf(filters);
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ghostBtn =
    'text-[12px] font-semibold border border-outline-variant rounded px-3 py-1.5 ' +
    'text-on-surface transition-colors hover:bg-surface-container-low';

  return (
    <div className="flex gap-2">
      <button onClick={() => download('csv')} className={ghostBtn}>
        Exportar CSV
      </button>
      <button onClick={() => download('pdf')} className={ghostBtn}>
        Exportar PDF
      </button>
    </div>
  );
}
