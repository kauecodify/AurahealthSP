"use client";

import { useState } from "react";
import { formatCns, isValidCns } from "@/lib/cns";

interface CnsSearchBarProps {
  disabled: boolean;
  onSearch: (cns: string) => void;
}

export default function CnsSearchBar({ disabled, onSearch }: CnsSearchBarProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = isValidCns(value);
  const digits = value.replace(/\D/g, "");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!valid || digits.length < 2) return;
    onSearch(digits);
  };

  return (
    <form id="cns-search" onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex-1">
        <label htmlFor="cns" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Cartão Nacional de Saúde (CNS)
        </label>
        <input
          id="cns"
          name="cns"
          inputMode="numeric"
          autoComplete="off"
          placeholder="000 0000 0000 0000"
          value={formatCns(value)}
          onChange={(event) => {
            if (event.target.value.length <= 18) setValue(event.target.value);
          }}
          className={`mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm text-slate-800 shadow-sm outline-none focus:border-clinical-600 focus:ring-2 focus:ring-clinical-100 ${
            touched && !valid ? "border-red-400 bg-red-50" : "border-slate-300"
          }`}
        />
        {touched && !valid && (
          <p className="mt-1 text-xs text-red-600">
            CNS deve ter 15 dígitos, iniciar em 1, 2, 7, 8 ou 9 e passar pela validação oficial do check digit.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="mt-5 h-10 rounded-lg bg-clinical-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0"
      >
        {disabled ? "Consultando..." : "Buscar histórico"}
      </button>
    </form>
  );
}
