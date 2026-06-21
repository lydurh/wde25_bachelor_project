import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ApiResponse<T> = { data: T };

export const ServicePage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get<ApiResponse<Service>>(
          `/services/${serviceId}`,
        );
        setService(res.data);
        setTitle(res.data.service_title);
        setDescription(res.data.service_description ?? '');
        setDuration(String(res.data.service_duration));
        setPrice(res.data.service_price);
      } catch {
        setService(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchService();
  }, [serviceId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.patch(`/services/${serviceId}`, {
        service_title: title,
        service_description: description || null,
        service_duration: Number(duration),
        service_price: price,
      });
      void navigate('/admin/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/services/${serviceId}`);
      void navigate('/admin/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!service) return <p>Service not found.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => void navigate('/admin/services')}
      >
        &larr; Tilbage til Services
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{service.service_title}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Beskrivelse</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Valgfri beskrivelse"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="duration">Varighed (minutter)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">Pris (f.eks. 50.00)</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                className="w-full sm:flex-1"
                disabled={submitting}
              >
                {submitting ? 'Gemmer...' : 'Gem Ændringer'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => void handleDelete()}
              >
                Slet
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
