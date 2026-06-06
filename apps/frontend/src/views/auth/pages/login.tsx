import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { loginInputSchema } from '@repo/shared';
import { api, getErrorMessage } from '@/lib/api';
import { auth } from '@/lib/auth';
import { flattenZodErrors } from '@/lib/zod-form';
import {
  AuthFormBanner,
  AuthFormField,
} from '@/components/auth/auth-form-field';
import type { User } from '@/types';

type LoginResponse = { data: { token: string; user: User } };

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verified = searchParams.get('verified') === '1';
  const verifyError = searchParams.get('verifyError') === '1';
  const signupSuccess = searchParams.get('signup') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginInputSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<LoginResponse>('/auth/login', parsed.data);
      auth.setToken(res.data.token);

      if (
        searchParams.has('verified') ||
        searchParams.has('verifyError') ||
        searchParams.has('signup')
      ) {
        setSearchParams({}, { replace: true });
      }

      if (auth.isAdmin()) {
        void navigate('/admin', { replace: true });
      } else {
        void navigate('/profile', { replace: true });
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

        <div className="flex flex-col gap-4 mb-4">
          {verified && (
            <AuthFormBanner variant="success">
              Email verified successfully. You can now log in.
            </AuthFormBanner>
          )}
          {signupSuccess && (
            <AuthFormBanner variant="success">
              Signup successful! Please verify your email before you can log in.
            </AuthFormBanner>
          )}
          {verifyError && (
            <AuthFormBanner variant="error">
              Verification link is invalid or has expired.
            </AuthFormBanner>
          )}
          {formError && (
            <AuthFormBanner variant="error">{formError}</AuthFormBanner>
          )}
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          noValidate
        >
          <AuthFormField
            id="email"
            name="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors['email']}
            disabled={isSubmitting}
            required
            autoComplete="email"
          />
          <AuthFormField
            id="password"
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors['password']}
            disabled={isSubmitting}
            required
            autoComplete="current-password"
          />
          <div>
            <Link to="/signup" className="text-sm text-primary hover:underline">
              Har du ikke en account? Sign up
            </Link>
          </div>
          <div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Glemt password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
};
