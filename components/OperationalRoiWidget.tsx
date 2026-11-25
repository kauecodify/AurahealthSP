"use client";

interface OperationalRoiWidgetProps {
  sessionMinutes: number;
  examsAvoided: number;
}

export default function OperationalRoiWidget({ sessionMinutes, examsAvoided }: OperationalRoiWidgetProps) {
  return (
    <section
      aria-label="Eficiência Operacional da Clínica/Operadora"
      className="flex flex-wrap items-center gap-4 rounded-xl border border-clinical-100 bg-white px-5 py-4 shadow-sm"
    >
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-clinical-700">
          Eficiência Operacional da Clínica/Operadora
        </p>
        <p className="mt-1 text-2xl font-bold text-clinical-900">
          Tempo médio economizado nesta sessão: {sessionMinutes} min
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Minutos de anamnese economizados · métrica institucional (fee SaaS pago pela instituição, não pelo médico)
        </p>
      </div>
      <div className="rounded-lg bg-clinical-50 px-4 py-3 text-center">
        <p className="text-xl font-bold text-clinical-700">{examsAvoided}</p>
        <p className="text-[11px] font-medium uppercase tracking-wide text-clinical-700">Exames duplicados evitados</p>
      </div>
    </section>
  );
}
