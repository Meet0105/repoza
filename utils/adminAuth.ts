import { getSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next';

/**
 * Check if a user is an admin based on their email
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Server-side admin check for pages
 * Use this in getServerSideProps to protect admin pages
 */
export async function requireAdmin(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  
  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin',
        permanent: false,
      },
    };
  }
  
  if (!isAdmin(session.user.email)) {
    return {
      redirect: {
        destination: '/?error=unauthorized',
        permanent: false,
      },
    };
  }
  
  return {
    props: {
      session,
    },
  };
}
