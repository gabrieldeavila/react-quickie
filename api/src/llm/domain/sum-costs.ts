/** Sum of the known costs; undefined when none is known. */
export function sumCosts(costs: Array<number | undefined>): number | undefined {
  const known = costs.filter((cost): cost is number => cost !== undefined);
  return known.length === 0
    ? undefined
    : known.reduce((total, cost) => total + cost, 0);
}
