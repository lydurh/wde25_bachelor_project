import { RouterProvider } from 'react-router';
import { TooltipProvider } from '@/components/ui/tooltip';
import { router } from '@/routes';

export function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}
