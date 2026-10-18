import { z } from 'zod';

/**
 * Password reset request schema.
 * Used by app/reset-password/page.js for the "forgot password" email form.
 */
export const resetSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});
