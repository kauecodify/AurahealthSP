import { NextResponse } from "next/server";
import { isValidCns } from "@/lib/cns";
import { aggregateUnifiedRecord, DEFAULT_WHITELIST } from "@/RNDS";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const cns = typeof body?.cns === "string" ? body.cns : "";
  const consentId = typeof body?.consentId === "string" ? body.consentId : "";

  if (!isValidCns(cns)) {
    return NextResponse.json({ error: "CNS inválido" }, { status: 400 });
  }
  if (!consentId.startsWith("cons-lgpd-")) {
    return NextResponse.json({ error: "Consentimento LGPD exigido antes da busca" }, { status: 403 });
  }

  const record = await aggregateUnifiedRecord({ cns, consentId }, DEFAULT_WHITELIST);
  return NextResponse.json(record);
}
