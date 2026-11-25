"use client";

import type { TimelineEntry } from "@/lib/clinical-types";

const KIND_META: Record<TimelineEntry["kind"], { label: string; badge: string }> = {
  consulta: { label: "Consulta", badge: "bg-clinical-50 text-clinical-700" },
  exame: { label: "Exame", badge: "bg-emerald-50 text-emerald-700" },
  regulacao: { label: "Regulação", badge: "bg-indigo-50 text-indigo-700" },
};

interface TimelinePanelProps {
  entries: TimelineEntry[] | null;
  provenance: string[];
}

export default function TimelinePanel({ entries, provenance }: TimelinePanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-clinical-700">
          Linha do Tempo Unificada RNDS/CROSS
        </h2>
        {provenance.length > 0 && (
          <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-500">
            {provenance.join(" · ")}
          </span>
        )}
      </div>

      {!entries ? (
        <p className="mt-4 text-sm text-slate-400">A linha do tempo aparece aqui após a consulta autorizada.</p>
      ) : (
        <ol className="mt-5 space-y-4 border-l-2 border-clinical-100 pl-5">
          {entries.map((entry) => {
            const meta = KIND_META[entry.kind];
            return (
              <li key={entry.id} className="relative">
                <span aria-hidden className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-clinical-600" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{entry.date}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>{meta.label}</span>
                  {entry.duplicidadeEvitada && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Exame duplicado evitado
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{entry.procedimento}</p>
                <p className="text-xs text-slate-500">
                  {entry.estabelecimento} · origem: {entry.origem}
                </p>
                <p className="mt-1 text-sm text-slate-600">{entry.resumo}</p>
                {entry.cid && <p className="mt-1 text-[11px] text-slate-400">CID-10: {entry.cid}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
