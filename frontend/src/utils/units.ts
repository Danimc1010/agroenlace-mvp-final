export interface UnitOption {
  label: string;
  value: string;
  factor: number;
  display: string;
}

export const getUnitOptions = (baseUnit: string): UnitOption[] => {
  const maps: Record<string, UnitOption[]> = {
    kg: [
      { label: 'Kilogramo — kg', value: 'kg', factor: 1, display: 'kg' },
      { label: 'Libra — 500g', value: 'libra', factor: 0.5, display: 'libra' },
      { label: 'Arroba — 12.5 kg', value: 'arroba', factor: 12.5, display: 'arroba' },
      { label: 'Gramo — 0.001 kg', value: 'gramo', factor: 0.001, display: 'g' },
      { label: 'Tonelada — 1000 kg', value: 'ton', factor: 1000, display: 'ton' },
    ],
    libra: [
      { label: 'Libra', value: 'libra', factor: 1, display: 'libra' },
      { label: 'Kilogramo — 2 libras', value: 'kg', factor: 2, display: 'kg' },
      { label: 'Arroba — 25 libras', value: 'arroba', factor: 25, display: 'arroba' },
      { label: 'Gramo — 0.002 kg', value: 'gramo', factor: 0.002, display: 'g' },
    ],
    ton: [
      { label: 'Tonelada', value: 'ton', factor: 1, display: 'ton' },
      { label: 'Kilogramo — 0.001 ton', value: 'kg', factor: 0.001, display: 'kg' },
      { label: 'Libra — 0.0005 ton', value: 'libra', factor: 0.0005, display: 'libra' },
    ],
    arroba: [
      { label: 'Arroba', value: 'arroba', factor: 1, display: 'arroba' },
      { label: 'Kilogramo — 0.08 arrobas', value: 'kg', factor: 0.08, display: 'kg' },
      { label: 'Libra — 0.04 arrobas', value: 'libra', factor: 0.04, display: 'libra' },
    ],
    bulto: [
      { label: 'Bulto', value: 'bulto', factor: 1, display: 'bulto' },
      { label: 'Unidad — 1/50 bulto', value: 'unidad', factor: 0.02, display: 'und' },
    ],
    caja: [
      { label: 'Caja', value: 'caja', factor: 1, display: 'caja' },
      { label: 'Unidad — 1/12 caja', value: 'unidad', factor: 0.083, display: 'und' },
    ],
    unidad: [
      { label: 'Unidad', value: 'unidad', factor: 1, display: 'und' },
    ],
  };
  return maps[baseUnit] || [{ label: baseUnit, value: baseUnit, factor: 1, display: baseUnit }];
};

export const toBaseUnit = (qty: number, factor: number): number =>
  parseFloat((qty * factor).toFixed(4));

export const priceInUnit = (basePrice: number, factor: number): number =>
  parseFloat((basePrice * factor).toFixed(0));
