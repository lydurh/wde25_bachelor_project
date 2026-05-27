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

export const ServicesPage = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          New Service
        </Button>
      </div>

      <div>
        <Table className="w-full bg-card rounded-md">
          <TableHeader className="bg-secondary-background">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
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
      </div>
    </div>
  );
};
