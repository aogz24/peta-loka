'use client';

import { useState } from 'react';

export default function Accordion({ items = [] }) {
  const [openId, setOpenId] = useState(null);

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-3">
      {items.map((it) => {
        const isOpen = openId === it.id;
        const panelId = `accordion-panel-${it.id}`;
        return (
          <div key={it.id} className="glass-card p-4">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(it.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(it.id);
                  }
                }}
                className="w-full text-left flex items-center justify-between gap-4"
              >
                <span className="font-semibold">{it.title}</span>
                <span className="text-sm text-zinc-500">{isOpen ? '—' : '+'}</span>
              </button>
            </h3>

            <div id={panelId} role="region" aria-labelledby={panelId + '-label'} className={`mt-3 text-sm text-zinc-700 dark:text-zinc-300 ${isOpen ? 'block' : 'hidden'}`}>
              {typeof it.content === 'string' ? <p>{it.content}</p> : it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
