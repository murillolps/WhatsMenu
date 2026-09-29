/**
 * Colunas DECIMAL chegam do MySQL como string. Este adaptador
 * garante que o model sempre exponha o valor como number.
 */
export const decimalColumn = {
  consume: (value: string | number) => Number(value),
}

/**
 * Operações monetárias são feitas em centavos (inteiros) para
 * evitar erros de ponto flutuante (ex.: 0.1 + 0.2).
 */
export function toCents(value: number): number {
  return Math.round(value * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}
