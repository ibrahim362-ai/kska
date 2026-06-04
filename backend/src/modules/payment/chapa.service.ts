/**
 * @deprecated Chapa integration is disabled. Use manual payment flow via /api/manual-payments.
 * This file is kept for reference only and will throw if invoked.
 */
import { BadRequestError } from '../../utils/errors';

export async function initializePayment(_opts: any) {
  throw new BadRequestError(
    'Chapa integration is disabled. Please use the manual payment flow (see /api/manual-payments/instructions).'
  );
}

export async function verifyPayment(_txRef: string) {
  throw new BadRequestError('Chapa integration is disabled.');
}

export async function handleCallback(_body: any) {
  throw new BadRequestError('Chapa integration is disabled.');
}
