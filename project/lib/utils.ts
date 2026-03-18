import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates a new fractional position between two items and detects if the
 * gap has become too small, requiring a background rebalance.
 */
export function calculateFractionalPosition(
  prevPosition?: number,
  nextPosition?: number
): { position: number; needsRebalance: boolean } {
  let newPosition: number
  let needsRebalance = false

  // Dropped perfectly between two items
  if (prevPosition !== undefined && nextPosition !== undefined) {
    newPosition = Math.round((prevPosition + nextPosition) / 2)
    // Collision detection: If rounding squished them together
    if (newPosition === prevPosition || newPosition === nextPosition) {
      needsRebalance = true
    }
  }
  // Dropped at the very bottom/right
  else if (prevPosition !== undefined) {
    newPosition = prevPosition + 65536
  }
  // Dropped at the very top/left
  else if (nextPosition !== undefined) {
    newPosition = Math.round(nextPosition / 2)
    // Edge case: If nextPosition was 1, half is 0.5, rounded is 1 (Collision!)
    if (newPosition === nextPosition) {
      needsRebalance = true
    }
  }
  // First item ever in an empty list
  else {
    newPosition = 65536
  }

  return { position: newPosition, needsRebalance }
}
