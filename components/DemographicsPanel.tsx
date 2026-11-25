"use client";

import type { PatientSnapshot } from "@/lib/clinical-types";
import { formatCns } from "@/lib/cns";

const SEVERITY_STYLES: Record<string, string> = {
  grave: "border-alert-border bg-alert-bg text-alert-text",
  moderada: "border-amber-200 bg-amber-50 text-amber-700",
  leve: "border-slate-200 bg-slate-50 text-slate-600",
};

interface DemographicsPanelProps {
  patient: PatientSnapshot | null;
}

export default function DemographicsPanel({ patient }: DemographicsPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-clinical-700">Dados Demográficos</h2>
      {!patient ? (
        <p className="mt-4 text-sm text-slate-400">Aguardando busca por CNS.</p>
      ) : (
        <>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Nome" value={patient.nome} />
            <Row label="CNS" value={formatCns(patient.cns)} mono />
            <Row label="Nascimento" value={patient.dataNascimento} />
            <Row label="Idade" value={`${patient.idade} anos`} />
            <Row label="Sexo" value={patient.sexo} />
            <Row label="Município" value={`${patient.municipio}/${patient.uf}`} />
          </dl>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-red-600">Alertas de Alergia</h3>
          <ul className="mt-2 space-y-2">
            {patient.alergias.map((allergy) => (
              <li
                key={allergy.substance}
                className={`rounded-lg border px-3 py-2 text-sm ${SEVERITY_STYLES[allergy.severity]}`}
              >
                <span className="font-semibold">{allergy.substance}</span>
                {allergy.reaction && <span className="block text-xs opacity-80">{allergy.reaction}</span>}
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-clinical-700">Condições Crônicas</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {patient.condicoesCronicas.map((condition) => (
              <li key={condition} className="rounded-full bg-clinical-50 px-3 py-1 text-xs font-medium text-clinical-700">
                {condition}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
