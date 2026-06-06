import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Service } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ApiResponse<T> = { data: T };

const PAGE_SIZE = 10;

export const ServicesPage = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(services.length / PAGE_SIZE);
  const pageItems = services.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes] = await Promise.all([
          api.get<ApiResponse<Service[]>>('/services'),
        ]);
        setServices(svcRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1>Services</h1>
        <Button onClick={() => void navigate('/admin/services/new')}>
          Tilføj Service
        </Button>
      </div>

      <div>
        <Table className="w-full bg-card rounded-md">
          <TableHeader className="bg-secondary-background">
            <TableRow>
              <TableHead>Navn</TableHead>
              <TableHead>Pris</TableHead>
              <TableHead>Varighed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((service) => (
              <TableRow
                key={service.service_pk}
                className="cursor-pointer"
                onClick={() =>
                  void navigate(`/admin/services/${service.service_pk}`)
                }
              >
                <TableCell>{service.service_title}</TableCell>
                <TableCell>{service.service_price}</TableCell>
                <TableCell>{service.service_duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Forrige
            </Button>
            <span className="text-sm text-muted-foreground">
              Side {page + 1} af {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Næste
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
