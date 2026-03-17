import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates a new fractional position between two items.
 * If dropping at the top, prev is undefined.
 * If dropping at the bottom, next is undefined.
 */
export function calculateFractionalPosition(prevPosition?: number, nextPosition?: number): number {
  if (prevPosition === undefined && nextPosition === undefined) {
    return 1000 // First item ever
  }
  if (prevPosition === undefined) {
    return Math.floor(nextPosition! / 2)
  }
  if (nextPosition === undefined) {
    return prevPosition! + 1000 // Dropped at the very bottom/right
  }

  // Dropped perfectly between two items
  return (prevPosition + nextPosition) / 2
}
