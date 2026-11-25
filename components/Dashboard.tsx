"use client";

import { useMemo, useState } from "react";
import type { ConsentAudit, UnifiedClinicalRecord } from "@/lib/clinical-types";
import { RNDS_INTEGRATION_NOTE } from "@/lib/hospital-metadata";
import CnsSearchBar from "./CnsSearchBar";
import DemographicsPanel from "./DemographicsPanel";
import LGPDConsentModal from "./LGPDConsentModal";
import OperationalRoiWidget from "./OperationalRoiWidget";
import TimelinePanel from "./TimelinePanel";

interface DashboardProps {
  baselineMinutes: number;
}

export default function Dashboard({ baselineMinutes }: DashboardProps) {
  const [consent, setConsent] = useState<ConsentAudit | null>(null);
  const [record, setRecord] = useState<UnifiedClinicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = (granted: ConsentAudit | null) => setConsent(granted);

  const handleSearch = async (cns: string) => {
    if (!consent) {
      setError("Feche o consentimento LGPD antes de buscar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cns, consentId: consent.consentId }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Falha na consulta" }));
        throw new Error(payload.error ?? "Falha na consulta RNDS/CROSS");
      }
      setRecord((await response.json()) as UnifiedClinicalRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const sessionMinutes = useMemo(() => {
    if (!record) return 0;
    return record.timeline.reduce((total, entry) => total + (entry.minutosEconomizados ?? 3), 0) || baselineMinutes;
  }, [record, baselineMinutes]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <header className="rounded-xl border border-clinical-600 bg-clinical-900 px-5 py-4 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AuraHealthSP</h1>
            <p className="mt-1 text-xs text-blue-100">
              Modo de Visualização Unificada - Leitura via RNDS/CROSS - Operação não-destrutiva ao PEP local
            </p>
          </div>
          <span className="rounded-full border border-blue-300/40 bg-blue-800/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wide">
            MVP v2.1 - Semana 4 (validação)
          </span>
        </div>
      </header>

      <div className="mt-4">
        <OperationalRoiWidget sessionMinutes={sessionMinutes || baselineMinutes} examsAvoided={record?.timeline.filter((t) => t.duplicidadeEvitada).length ?? 0} />
      </div>

      <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-clinical-700">
        {RNDS_INTEGRATION_NOTE}
      </p>

      <div className="mt-4">
        <CnsSearchBar disabled={loading} onSearch={handleSearch} />
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!record && !error && !loading && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
          Busque por um CNS válido (ex.: <span className="font-mono">245 0000 0000 0003</span>) para carregar a linha do tempo unificada.
        </section>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <DemographicsPanel patient={record?.patient ?? null} />
        <TimelinePanel entries={record?.timeline ?? null} provenance={record?.provenance ?? []} />
      </div>

      {!consent && <LGPDConsentModal patientCns="245000000000003" onDecision={handleConsent} />}

      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30" role="status">
          <span className="animate-pulse rounded-lg bg-white px-6 py-3 text-sm font-medium text-clinical-700 shadow">
            Consultando RNDS / CROSS...
          </span>
        </div>
      )}
    </main>
  );
}
