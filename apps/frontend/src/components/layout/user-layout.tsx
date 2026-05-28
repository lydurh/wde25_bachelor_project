import { Outlet } from 'react-router';

export const UserLayout = () => {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-4xl p-6">
        <Outlet />
      </main>
    </div>
  );
};
