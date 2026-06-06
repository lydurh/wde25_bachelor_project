import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminUser, Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type ApiResponse<T> = { data: T };

export const SettingsPage = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [locationFk, setLocationFk] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, locRes] = await Promise.all([
          api.get<ApiResponse<AdminUser[]>>('/users'),
          api.get<ApiResponse<Location[]>>('/locations'),
        ]);

        // Find the first admin user as the current user (auth not wired yet)
        const adminUser = usersRes.data.find((u) => u.user_role === 'admin');
        if (!adminUser) {
          setError('No admin user found');
          return;
        }

        setUser(adminUser);
        setFirstName(adminUser.user_first_name);
        setLastName(adminUser.user_last_name);
        setEmail(adminUser.user_email);
        setLocationFk(adminUser.user_location_fk ?? '');
        setLocations(locRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setSavingProfile(true);

    try {
      await api.patch(`/users/${user?.user_pk}`, {
        user_first_name: firstName,
        user_last_name: lastName,
        user_email: email,
        user_location_fk: locationFk || undefined,
      });
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : 'Failed to update profile',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (password !== repeatPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setSavingPassword(true);

    try {
      await api.patch(`/users/${user?.user_pk}`, {
        user_password: password,
        repeat_password: repeatPassword,
      });
      setPassword('');
      setRepeatPassword('');
      setPasswordSuccess(true);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Failed to update password',
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!user) return <p>Bruger ikke fundet.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6">Indstillinger</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          {profileError && (
            <p className="mb-3 text-sm text-destructive">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="mb-3 text-sm text-green-600">Profil opdateret.</p>
          )}

          <form
            onSubmit={(e) => void handleProfileSave(e)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName">Fornavn</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Efternavn</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="location">Lokation</Label>
              <select
                id="location"
                value={locationFk}
                onChange={(e) => setLocationFk(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Ingen lokation</option>
                {locations.map((loc) => (
                  <option key={loc.location_pk} value={loc.location_pk}>
                    {loc.location_address}, {loc.location_city}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Gem Profil'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>Skift Password</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordError && (
            <p className="mb-3 text-sm text-destructive">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="mb-3 text-sm text-green-600">Password updated.</p>
          )}

          <form
            onSubmit={(e) => void handlePasswordSave(e)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="password">Nyt Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="repeatPassword">Bekræft Password</Label>
              <Input
                id="repeatPassword"
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Saving...' : 'Skift Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
