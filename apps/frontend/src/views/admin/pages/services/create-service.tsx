import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CreateServicePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/services', {
        service_title: title,
        service_description: description || null,
        service_duration: Number(duration),
        service_price: price,
      });
      void navigate('/admin/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

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
          <CardTitle>Opret ny Service</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Klip"
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
                placeholder="e.g. 30"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">Pris (e.g. 50.00)</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Opretter...' : 'Opret Service'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
