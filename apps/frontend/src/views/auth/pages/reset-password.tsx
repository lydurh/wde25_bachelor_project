import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { resetPasswordInputSchema } from '@repo/shared';
import { api, ApiError, getErrorMessage } from '@/lib/api';
import { flattenApiIssues, flattenZodErrors } from '@/lib/zod-form';
import {
  AuthFormBanner,
  AuthFormField,
} from '@/components/auth/auth-form-field';

type ResetResponse = { data: { message: string } };

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (newPassword !== repeatPassword) {
      setFieldErrors({ repeat_password: 'Passwords do not match' });
      return;
    }

    const parsed = resetPasswordInputSchema.safeParse({
      token,
      newPassword,
    });

    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post<ResetResponse>('/auth/reset-password', parsed.data);
      void navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        setFieldErrors(flattenApiIssues(err.issues));
      }
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-6 text-center">
          <AuthFormBanner variant="error">
            Kan ikke verificere, brug venligst linket fra din email.
          </AuthFormBanner>
          <p className="mt-4">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Gensend et reset link
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">
          Nulstil Password
        </h1>

        {formError && (
          <div className="mb-4">
            <AuthFormBanner variant="error">{formError}</AuthFormBanner>
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          noValidate
        >
          <AuthFormField
            id="newPassword"
            name="newPassword"
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={fieldErrors['newPassword']}
            disabled={isSubmitting}
            required
            autoComplete="new-password"
          />
          <AuthFormField
            id="repeat_password"
            name="repeat_password"
            label="Repeat password"
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            error={fieldErrors['repeat_password']}
            disabled={isSubmitting}
            required
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </section>
  );
};
