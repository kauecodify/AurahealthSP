const WEIGHT_FIRST_BRANCH_MAX_INDEX = 14;

export function cleanCns(input: string): string {
  return input.replace(/\D/g, "");
}

export function formatCns(cns: string): string {
  const digits = cleanCns(cns);
  if (digits.length !== 15) return cns;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)} ${digits.slice(11, 15)}`;
}

export function isValidCns(input: string): boolean {
  const cns = cleanCns(input);
  if (cns.length !== 15) return false;
  const first = cns[0];
  if (!["1", "2", "7", "8", "9"].includes(first)) return false;
  return first === "1" || first === "2" ? isValidConventionalCns(cns) : isValidPsicossocialCns(cns);
}

function isValidConventionalCns(cns: string): boolean {
  let sum = 0;
  for (let i = 0; i <= WEIGHT_FIRST_BRANCH_MAX_INDEX; i++) {
    sum += Number(cns[i]) * (15 - i);
  }
  return sum % 11 === 0;
}

function isValidPsicossocialCns(cns: string): boolean {
  let sum = 0;
  for (let i = 0; i <= 10; i++) {
    sum += Number(cns[i]) * (15 - i);
  }
  const dv1 = computeCheckDigit(sum);
  if (dv1 !== 10) {
    return Number(`${sum}${dv1}${cns.slice(12)}`) === Number(cns.slice(0, 12) + dv1 + cns.slice(12));
  }
  const sum2 = sum + 2;
  const dv2 = computeCheckDigit(sum2);
  return Number(`${sum2}${dv2}`) === Number(cns.slice(0, 12));
}

function computeCheckDigit(sum: number): number {
  const remainder = sum % 11;
  return remainder === 0 ? 0 : 11 - remainder;
}
