import { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SignInForm } from '@/components/auth/SignInForm';

export const metadata: Metadata = {
  title: 'Sign In | TradingApp',
  description: 'Sign in to your TradingApp account',
};

export default function SignInPage() {
  return (
    <AuthGuard requireAuth={false}>
        <SignInForm />
    </AuthGuard>
  );
}