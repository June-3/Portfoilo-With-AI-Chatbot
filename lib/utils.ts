import { clsx, type ClassValue } from "clsx";

/**
 * 合并条件类名为单个字符串。/ Merge conditional class names into a single string.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
