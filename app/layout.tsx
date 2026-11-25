import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AuraHealthSP - Visualização Unificada RNDS/CROSS",
  description:
    "Camada de leitura não-destrutiva sobre o PEP legado: histórico longitudinal do paciente via RNDS e CROSS com compliance LGPD.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100 text-slate-800 antialiased">{children}</body>
    </html>
  );
}
