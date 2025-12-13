import { auth } from '@clerk/nextjs/server';

const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export async function requireAdmin() {
  // If Clerk is not configured, skip auth check (development mode)
  if (!clerkConfigured) {
    return 'dev-admin';
  }
  
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return userId;
}
