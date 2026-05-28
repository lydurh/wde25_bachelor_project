import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Availability } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ApiResponse<T> = { data: T };

const formatTime = (time: string) => time.slice(0, 5);

export const AvailabilityDetailPage = () => {
  const { availabilityId } = useParams();
  const navigate = useNavigate();

  const [slot, setSlot] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        const res = await api.get<ApiResponse<Availability>>(
          `/availability/${availabilityId}`,
        );
        setSlot(res.data);
        setDate(res.data.availability_date);
        setStartTime(formatTime(res.data.availability_start_time));
        setEndTime(formatTime(res.data.availability_end_time));
      } catch {
        setSlot(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchSlot();
  }, [availabilityId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startTime >= endTime) {
      setError('Start time must be before end time');
      return;
    }

    setSubmitting(true);

    try {
      await api.patch(`/availability/${availabilityId}`, {
        availability_date: date,
        availability_start_time: startTime,
        availability_end_time: endTime,
      });
      void navigate('/admin/availability');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update availability',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/availability/${availabilityId}`);
      void navigate('/admin/availability');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete availability',
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!slot) return <p>Availability slot not found.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => void navigate('/admin/availability')}
      >
        &larr; Back to Availability
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            {slot.availability_date} —{' '}
            {formatTime(slot.availability_start_time)}–
            {formatTime(slot.availability_end_time)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDelete()}
              >
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
