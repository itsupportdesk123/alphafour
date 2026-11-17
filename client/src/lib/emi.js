/**
 * Equated monthly instalment for a reducing-balance home loan.
 * EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate, n = months
 */
export function calculateEmi({ principal, annualRatePct, tenureYears }) {
  const months = Math.max(1, Math.round(tenureYears * 12));
  const r = annualRatePct / 12 / 100;
  const emi = r === 0 ? principal / months : (principal * r * (1 + r) ** months) / ((1 + r) ** months - 1);
  const totalPayment = emi * months;
  return {
    emi,
    months,
    totalPayment,
    totalInterest: totalPayment - principal,
  };
}

export const EMI_LIMITS = {
  price: { min: 20_000_000, max: 500_000_000, step: 5_000_000 },
  downPaymentPct: { min: 10, max: 80, step: 5 },
  rate: { min: 6.5, max: 13, step: 0.05 },
  tenure: { min: 5, max: 30, step: 1 },
};
