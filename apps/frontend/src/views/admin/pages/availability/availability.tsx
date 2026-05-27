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

const formatTime = (time: string) => time.slice(0, 5);

export const AvailabilityPage = () => {
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res =
          await api.get<ApiResponse<Availability[]>>('/availability');
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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1>Availability</h1>
        <Button onClick={() => void navigate('/admin/availability/new')}>
          New Availability
        </Button>
      </div>

      <div>
        <Table className="w-full rounded-md bg-card">
          <TableHeader className="bg-secondary-background">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((slot) => (
              <TableRow
                key={slot.availability_pk}
                className="cursor-pointer"
                onClick={() =>
                  void navigate(
                    `/admin/availability/${slot.availability_pk}`,
                  )
                }
              >
                <TableCell>{slot.availability_date}</TableCell>
                <TableCell>
                  {formatTime(slot.availability_start_time)}
                </TableCell>
                <TableCell>
                  {formatTime(slot.availability_end_time)}
                </TableCell>
                <TableCell>{slot.availability_type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
