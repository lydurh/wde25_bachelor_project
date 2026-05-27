import { Outlet } from 'react-router';

export const AuthLayout = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <Outlet />
      </div>
    </div>
  );
};
