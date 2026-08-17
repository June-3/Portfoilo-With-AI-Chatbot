import { clsx, type ClassValue } from "clsx";

/**
 * Merge conditional class names into a single string.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
