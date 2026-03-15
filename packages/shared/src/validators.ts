export function isValidTransition(
  transitions: Record<string, string[]>,
  from: string,
  to: string,
): boolean {
  return transitions[from]?.includes(to) ?? false;
}
