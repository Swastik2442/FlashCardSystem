import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to merge Tailwind CSS classes with other classes.
 * @param inputs The classes to merge
 * @returns resulting classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
