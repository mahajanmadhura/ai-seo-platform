import React from 'react';
import { Download, FileSpreadsheet, FileCode, Loader2 } from 'lucide-react';

export default function ExportButtons({ onExport, exporting }) {
  return (
    <div className="flex items-center gap-2 font-sans">
      <button
        onClick={() => onExport('pdf')}
        disabled={exporting}
        className="px-3 py-1.5 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
      >
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        <span>PDF</span>
      </button>

      <button
        onClick={() => onExport('excel')}
        disabled={exporting}
        className="px-3 py-1.5 bg-white text-zinc-900 border border-zinc-200 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
        <span>Excel</span>
      </button>

      <button
        onClick={() => onExport('json')}
        disabled={exporting}
        className="px-3 py-1.5 bg-white text-zinc-900 border border-zinc-200 text-xs font-bold rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
      >
        <FileCode className="w-3.5 h-3.5 text-amber-600" />
        <span>JSON</span>
      </button>
    </div>
  );
}
