// Simple in-memory rate limiter for development
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  max: number       // Max requests per window
}

export function rateLimit(config: RateLimitConfig = { windowMs: 60000, max: 10 }) {
  return async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    // Clean up old entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key)
        }
      }
    }

    if (!entry || entry.resetTime < now) {
      // New window
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return { allowed: true, remaining: config.max - 1 }
    }

    if (entry.count >= config.max) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0 }
    }

    // Increment count
    entry.count++
    return { allowed: true, remaining: config.max - entry.count }
  }
}

// Preset rate limiters
export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }) // 5 attempts per 15 minutes
export const apiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 60 }) // 60 requests per minute
export const strictRateLimit = rateLimit({ windowMs: 60 * 1000, max: 10 }) // 10 requests per minute