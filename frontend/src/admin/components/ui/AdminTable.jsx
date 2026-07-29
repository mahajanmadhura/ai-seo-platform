import React from 'react';
import AdminSkeleton from './AdminSkeleton';
import AdminEmptyState from './AdminEmptyState';

export default function AdminTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records matching your request.',
  renderRow,
  onRowClick,
}) {
  if (isLoading) {
    return <AdminSkeleton rows={6} columns={columns.length || 4} />;
  }

  if (!data || data.length === 0) {
    return <AdminEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full font-sans">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-zinc-50 border-b border-zinc-200 z-10">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-5 py-3 font-bold uppercase tracking-wider text-zinc-500 text-[10px] whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {data.map((item, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick ? 'hover:bg-zinc-50/80 cursor-pointer' : 'hover:bg-zinc-50/50'
              }`}
            >
              {renderRow(item, idx)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
