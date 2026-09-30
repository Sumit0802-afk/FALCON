/** Short, collision-safe id generator (no external dependency needed). */
export function generateId(prefix = "el"): string {
  const random = Math.random().toString(36).slice(2, 9);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${random}`;
}
