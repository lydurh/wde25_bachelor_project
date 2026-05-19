export const LoginPage = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-border p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

        <form className="flex flex-col gap-4" id="signup">
          <div className="flex flex-col gap-2">
            <label htmlFor="user_email" className="text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="user_email"
              id="user_email"
              required
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="user_password" className="text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="user_password"
              id="user_password"
              required
              className="w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
};
