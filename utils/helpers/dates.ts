export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date;
}

export function isValidDate(dateString: string): boolean {
  try {
    parseDate(dateString);
    return true;
  } catch {
    return false;
  }
}
