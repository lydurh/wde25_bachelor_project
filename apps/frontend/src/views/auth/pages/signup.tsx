import { useState } from 'react';
import { useNavigate } from 'react-router';
import { signupInputSchema, type User } from '@repo/shared';
import { api, ApiError, getErrorMessage } from '@/lib/api';
import { flattenApiIssues, flattenZodErrors } from '@/lib/zod-form';
import {
  AuthFormBanner,
  AuthFormField,
} from '@/components/auth/auth-form-field';

type SignupResponse = { data: User };

export const SignupPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    postal_code: '',
    city: '',
    password: '',
    repeat_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (form.password !== form.repeat_password) {
      setFieldErrors({ repeat_password: 'Passwords do not match' });
      return;
    }

    const parsed = signupInputSchema.safeParse({
      first_name: form.first_name,
      last_name: form.last_name || undefined,
      email: form.email,
      password: form.password,
      address: form.address,
      postal_code: form.postal_code,
      city: form.city,
    });

    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post<SignupResponse>('/auth/signup', parsed.data);
      void navigate('/login?signup=1', { replace: true });
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
      <div className="w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <h1 className="text-3xl font-semibold text-center mb-6">Sign Up</h1>

        {formError && (
          <div className="mb-4">
            <AuthFormBanner variant="error">{formError}</AuthFormBanner>
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          id="signup"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          noValidate
        >
          <AuthFormField
            id="first_name"
            name="first_name"
            label="First Name"
            value={form.first_name}
            onChange={handleChange}
            error={fieldErrors['first_name']}
            disabled={isSubmitting}
            required
            autoComplete="given-name"
          />
          <AuthFormField
            id="last_name"
            name="last_name"
            label="Last Name"
            value={form.last_name}
            onChange={handleChange}
            error={fieldErrors['last_name']}
            disabled={isSubmitting}
            autoComplete="family-name"
          />
          <AuthFormField
            id="email"
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors['email']}
            disabled={isSubmitting}
            required
            autoComplete="email"
          />
          <AuthFormField
            id="address"
            name="address"
            label="Address"
            value={form.address}
            onChange={handleChange}
            error={fieldErrors['address']}
            disabled={isSubmitting}
            required
            autoComplete="street-address"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AuthFormField
              id="postal_code"
              name="postal_code"
              label="Postal Code"
              value={form.postal_code}
              onChange={handleChange}
              error={fieldErrors['postal_code']}
              disabled={isSubmitting}
              required
              autoComplete="postal-code"
            />
            <AuthFormField
              id="city"
              name="city"
              label="City"
              value={form.city}
              onChange={handleChange}
              error={fieldErrors['city']}
              disabled={isSubmitting}
              required
              autoComplete="address-level2"
            />
          </div>
          <AuthFormField
            id="password"
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors['password']}
            disabled={isSubmitting}
            required
            autoComplete="new-password"
          />
          <AuthFormField
            id="repeat_password"
            name="repeat_password"
            label="Repeat Password"
            type="password"
            value={form.repeat_password}
            onChange={handleChange}
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
            {isSubmitting ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>
      </div>
    </section>
  );
};
