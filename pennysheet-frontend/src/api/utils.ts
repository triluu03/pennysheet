/**
 * Format datetime into date.
 */
export const formatDate = (d: Date) => d.toISOString().split("T")[0];
