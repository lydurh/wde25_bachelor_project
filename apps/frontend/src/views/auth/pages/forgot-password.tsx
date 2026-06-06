import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { auth } from '@/lib/auth';
import { forgotPasswordInputSchema } from '@repo/shared';
import { api, ApiError, getErrorMessage } from '@/lib/api';
import { flattenApiIssues, flattenZodErrors } from '@/lib/zod-form';
import {
  AuthFormBanner,
  AuthFormField,
} from '@/components/auth/auth-form-field';

type ForgotResponse = { data: { message: string } };

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(
    () => searchParams.get('email')?.trim() ?? '',
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setMessage(null);
    setFieldErrors({});

    const parsed = forgotPasswordInputSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post<ForgotResponse>(
        '/auth/forgot-password',
        parsed.data,
      );
      setMessage(res.data.message);
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        setFieldErrors(flattenApiIssues(err.issues));
      }
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Glemt Password
        </h1>

        <div className="flex flex-col gap-4 mb-4">
          {message && (
            <AuthFormBanner variant="success">{message}</AuthFormBanner>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {auth.isAuthenticated() ? (
            <Link to="/profile" className="text-primary hover:underline">
              Tilbage til profil
            </Link>
          ) : (
            <Link to="/login" className="text-primary hover:underline">
              Tilbage til login
            </Link>
          )}
        </p>
      </div>
    </section>
  );
};
