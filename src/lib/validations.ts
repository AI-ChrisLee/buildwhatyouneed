import { z } from 'zod'

// Auth validations
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Lead validation
export const leadSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
  pain_level: z.number().min(1).max(10).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

// Thread validation
export const createThreadSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content too long'),
  category: z.enum(['announcements', 'general', 'show-tell', 'help']),
})

// Comment validation
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment too long'),
})

// General ID validation
export const uuidSchema = z.string().uuid('Invalid ID format')