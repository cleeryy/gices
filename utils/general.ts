function parseNumber(value: string | undefined | null): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return Number.isNaN(num) || num < 1 ? undefined : num;
}

export { parseNumber };
