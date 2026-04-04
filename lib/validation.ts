import { z } from 'zod';

// ── Auth schemas ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ── Product schema ────────────────────────────────────────────────────────────
// Fixed: 'categoryId' is a MongoDB ObjectId string ref (not a hardcoded enum).
// Fixed: removed 'stock' — stock lives in the Inventory collection, not on Product.
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  categoryId: z.string().min(1, 'Category is required'),         // ObjectId string
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  nutrients: z
    .object({
      protein: z.string().optional(),
      fat: z.string().optional(),
      fiber: z.string().optional(),
      moisture: z.string().optional(),
      others: z.string().optional(),
    })
    .optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  images: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

// ── Order schema (pickup-only platform) ──────────────────────────────────────
// Fixed: removed 'delivery' from deliveryType — this is a pickup-only system.
// Fixed: removed shippingAddress — no delivery means no address needed.
// Fixed: locationId is required (the pickup store).
export const orderItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  locationId: z.string().min(1, 'Pickup location is required'),
  notes: z.string().max(500).optional(),
});

// ── Review schema ─────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment cannot exceed 1000 characters'),
});

// ── Contact schema ────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message cannot exceed 5000 characters'),
  locationId: z.string().optional(),
});

// ── CMS content schema ────────────────────────────────────────────────────────
export const contentSchema = z.object({
  key: z.enum(['privacy', 'terms', 'about', 'footer', 'contact', 'hero']),
  title: z.string().min(2, 'Title is required'),
  value: z.string().min(1, 'Content is required'),
});

// ── Type exports ──────────────────────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
