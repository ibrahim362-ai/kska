import { z } from 'zod';

// =====================================================================
// Reusable validation schemas
// =====================================================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number (e.g., +251911223344)');

// =====================================================================
// Common form schemas
// =====================================================================

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: emailSchema,
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: phoneSchema.optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, 'Code must be 6 digits'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const manualPaymentProofSchema = z.object({
  senderName: z.string().min(2, 'Sender name must be at least 2 characters'),
  senderPhone: phoneSchema.optional().or(z.literal('')),
  transactionRef: z.string().max(100).optional().or(z.literal('')),
  paidAt: z.string().min(1, 'Date paid is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const reviewProofSchema = z
  .object({
    decision: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().max(500).optional(),
  })
  .refine(
    (data) => data.decision !== 'REJECTED' || (data.rejectionReason && data.rejectionReason.length >= 5),
    {
      message: 'Rejection reason is required (min 5 characters)',
      path: ['rejectionReason'],
    }
  );

// =====================================================================
// Type exports
// =====================================================================
export type SigninForm = z.infer<typeof signinSchema>;
export type SignupForm = z.infer<typeof signupSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type ManualPaymentProofForm = z.infer<typeof manualPaymentProofSchema>;
export type ReviewProofForm = z.infer<typeof reviewProofSchema>;

/**
 * Helper to convert Zod errors to a flat object { fieldName: errorMessage }
 */
export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!result[path]) {
      result[path] = issue.message;
    }
  }
  return result;
}
