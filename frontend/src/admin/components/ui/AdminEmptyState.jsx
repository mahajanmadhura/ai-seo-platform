import React from 'react';
import { Inbox } from 'lucide-react';

export default function AdminEmptyState({ title = "No records found", description = "There are no entries available for this view." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-soft-bg flex items-center justify-center text-muted-text">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-deep-green">{title}</h4>
      <p className="text-xs text-muted-text max-w-sm">{description}</p>
    </div>
  );
}
