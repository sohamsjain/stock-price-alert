import { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up | TradingApp',
  description: 'Create your TradingApp account',
};

export default function SignUpPage() {
  return (
    <AuthGuard requireAuth={false}>
        <SignUpForm />
    </AuthGuard>
  );
}