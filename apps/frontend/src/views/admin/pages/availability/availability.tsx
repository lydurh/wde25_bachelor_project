import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Availability } from '@/types';
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
const formatTime = (time: string) => time.slice(0, 5);

export const AvailabilityPage = () => {
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<ApiResponse<Availability[]>>('/availability');
        setSlots(res.data);
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

  const totalPages = Math.ceil(slots.length / PAGE_SIZE);
  const pageSlots = slots.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1>Arbejdstider</h1>
        <Button onClick={() => void navigate('/admin/availability/new')}>
          Ny Arbejdstid
        </Button>
      </div>

      {slots.length === 0 ? (
        <p className="text-muted-foreground">Ingen arbejdstider fundet.</p>
      ) : (
        <>
          <Table className="w-full rounded-md bg-card">
            <TableHeader className="bg-secondary-background">
              <TableRow>
                <TableHead>Dato</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Slut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageSlots.map((slot) => (
                <TableRow
                  key={slot.availability_pk}
                  className="cursor-pointer"
                  onClick={() =>
                    void navigate(`/admin/availability/${slot.availability_pk}`)
                  }
                >
                  <TableCell>{slot.availability_date}</TableCell>
                  <TableCell>
                    {formatTime(slot.availability_start_time)}
                  </TableCell>
                  <TableCell>
                    {formatTime(slot.availability_end_time)}
                  </TableCell>
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
        </>
      )}
    </div>
  );
};
