import { NextResponse } from "next/server";
import { isValidCns } from "@/lib/cns";
import { mintMockConsentAudit } from "@/lib/mock-rnds-data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cns = typeof body?.cns === "string" ? body.cns : "";
  const granted = body?.granted === true;

  if (!isValidCns(cns)) {
    return NextResponse.json({ error: "CNS inválido" }, { status: 400 });
  }
  if (!granted) {
    return NextResponse.json({ error: "Consentimento LGPD obrigatório" }, { status: 403 });
  }

  const audit = mintMockConsentAudit();
  return NextResponse.json({ consent: audit, cnsLookupAllowedUntil: audit.grantedAt }, { status: 201 });
}
