"use client";

import type { ConsentAudit } from "@/lib/clinical-types";
import { formatCns } from "@/lib/cns";

interface LGPDConsentModalProps {
  patientCns: string;
  onDecision: (consent: ConsentAudit | null) => void;
}

export default function LGPDConsentModal({ patientCns, onDecision }: LGPDConsentModalProps) {
  const grant = async () => {
    const response = await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cns: patientCns, granted: true }),
    });
    const payload = await response.json();
    onDecision(response.ok ? payload.consent : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lgpd-title"
      >
        <h2 id="lgpd-title" className="text-lg font-semibold text-clinical-900">
          Consentimento LGPD
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Para consultar o histórico clínico unificado, é necessário o consentimento do titular dos dados (CNS{" "}
          <span className="font-mono">{formatCns(patientCns)}</span>), conforme os Arts. 7º e 11 da Lei nº 13.709/2018 (LGPD) e o fluxo de
          autorização da RNDS/Conecte SUS.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span aria-hidden>•</span> Dados consultados apenas em leitura.</li>
          <li className="flex gap-2"><span aria-hidden>•</span> Acesso registrado em log de auditoria imutável.</li>
          <li className="flex gap-2"><span aria-hidden>•</span> Finalidade restrita ao atendimento clínico desta sessão.</li>
          <li className="flex gap-2"><span aria-hidden>•</span> O titular pode revogar o consentimento a qualquer momento.</li>
        </ul>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onDecision(null)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={grant}
            className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinical-700"
          >
            Autorizar consulta RNDS
          </button>
        </div>
      </div>
    </div>
  );
}
