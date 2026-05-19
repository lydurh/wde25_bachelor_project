import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type SignupSuccess = {
  message: string;
};

type SignupError = {
  error: string;
};

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.repeat_password) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          address: form.address,
          postal_code: form.postal_code,
          city: form.city,
        }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as SignupError;
        console.error('Backend error:', errorData);
        return;
      }

      const data = (await res.json()) as SignupSuccess;
      console.log('SUCCESS:', data);

      // Redirect to login page after successful signup
      void navigate('/login');
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
        <h1 className="text-3xl font-semibold text-center mb-6">Sign Up</h1>

        <form
          className="flex flex-col gap-4"
          id="signup"
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          {/* First name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Last name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Postal + City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Repeat password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Repeat Password</label>
            <input
              type="password"
              name="repeat_password"
              value={form.repeat_password}
              onChange={handleChange}
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Sign Up
          </button>
        </form>
      </div>
    </section>
  );
};
