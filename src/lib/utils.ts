import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function safeRedirectPath(
  value?: string | null,
  fallback: string = '/_authenticated/'
) {
  if (!value) return fallback

  try {
    const url = new URL(value, 'http://localhost')
    const path = `${url.pathname}${url.search}${url.hash}`
    if (path.startsWith('/')) {
      return path
    }
  } catch (_error) {
    if (value.startsWith('/')) {
      return value
    }
  }

  return fallback
}

type LocationLike = {
  href?: string
  pathname?: string
  search?: string | Record<string, unknown>
  hash?: string
}

function stringifySearch(
  search?: string | Record<string, unknown>
): string {
  if (!search) return ''
  if (typeof search === 'string') {
    return search.startsWith('?') ? search : `?${search.replace(/^\?/, '')}`
  }

  const params = new URLSearchParams()
  Object.entries(search).forEach(([key, value]) => {
    if (value == null) return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null) params.append(key, String(item))
      })
    } else {
      params.append(key, String(value))
    }
  })
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

export function buildPathFromLocation(location?: LocationLike) {
  if (!location) return '/_authenticated/'
  if (location.href) {
    try {
      const url = new URL(location.href)
      return `${url.pathname}${url.search}${url.hash}`
    } catch {
      // ignore and continue building manually
    }
  }
  const pathname = location.pathname ?? '/'
  const search = stringifySearch(location.search)
  const hash = location.hash ?? ''
  return `${pathname}${search}${hash}`
}

export function getInitials(value?: string | null, fallback = 'NA') {
  if (!value) return fallback
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return fallback
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  return initials || fallback
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}
