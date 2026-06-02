import { useCallback, useRef, useState } from 'react';
import { Link, useRevalidator } from 'react-router';
import { updateUserSchema, type Location, type User } from '@repo/shared';
import { api, ApiError, getErrorMessage } from '@/lib/api';
import { flattenApiIssues, flattenZodErrors } from '@/lib/zod-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlaceAutocomplete } from '@/views/booking/use-place-autocomplete';

type EditUserDetailsFormProps = {
  user: User;
};

type FormFields = Pick<
  User,
  'user_first_name' | 'user_last_name' | 'user_email'
>;

const toFormFields = (user: User): FormFields => ({
  user_first_name: user.user_first_name,
  user_last_name: user.user_last_name,
  user_email: user.user_email,
});

export const EditUserDetailsForm = ({ user }: EditUserDetailsFormProps) => {
  const { revalidate } = useRevalidator();
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState(() => toFormFields(user));
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onAddressSelected = useCallback((address: string) => {
    setPendingAddress(address);
  }, []);

  usePlaceAutocomplete(autocompleteContainerRef, onAddressSelected, {
    enabled: open,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(toFormFields(user));
    setPendingAddress(null);
    setFieldErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      resetForm();
    } else {
      setFieldErrors({});
    }
  };

  const handleConfirmOpenChange = (nextOpen: boolean) => {
    setConfirmOpen(nextOpen);
    if (!nextOpen) setConfirmError(null);
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = updateUserSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error.issues));
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    const parsed = updateUserSchema.safeParse(form);
    if (!parsed.success) return;

    setSaving(true);
    setConfirmError(null);
    try {
      const payload = { ...parsed.data };

      if (pendingAddress?.trim()) {
        const { data: location } = await api.post<{ data: Location }>(
          '/locations/from-address',
          { formattedAddress: pendingAddress.trim() },
        );
        payload.user_location_fk = location.location_pk;
      }

      await api.patch<{ data: User }>(`/users/${user.user_pk}`, payload);
      setConfirmOpen(false);
      setOpen(false);
      void revalidate();
    } catch (err) {
      if (err instanceof ApiError && err.issues) {
        setFieldErrors(flattenApiIssues(err.issues));
        setConfirmOpen(false);
      }
      setConfirmError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Rediger oplysninger
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-visible sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rediger dine oplysninger</DialogTitle>
            <DialogDescription>
              Opdater dit navn, din e-mail og din adresse. Ændringerne gemmes på
              din profil.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => handleSaveClick(e)} className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <Field data-invalid={!!fieldErrors['user_first_name']}>
                  <Label htmlFor="user_first_name">Fornavn</Label>
                  <Input
                    id="user_first_name"
                    name="user_first_name"
                    value={form.user_first_name}
                    onChange={handleChange}
                    required
                    aria-invalid={!!fieldErrors['user_first_name']}
                  />
                  {fieldErrors['user_first_name'] && (
                    <FieldError>{fieldErrors['user_first_name']}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!fieldErrors['user_last_name']}>
                  <Label htmlFor="user_last_name">Efternavn</Label>
                  <Input
                    id="user_last_name"
                    name="user_last_name"
                    value={form.user_last_name}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors['user_last_name']}
                  />
                  {fieldErrors['user_last_name'] && (
                    <FieldError>{fieldErrors['user_last_name']}</FieldError>
                  )}
                </Field>
              </div>
              <Field data-invalid={!!fieldErrors['user_email']}>
                <Label htmlFor="user_email">E-mail</Label>
                <Input
                  id="user_email"
                  name="user_email"
                  type="email"
                  value={form.user_email}
                  onChange={handleChange}
                  required
                  aria-invalid={!!fieldErrors['user_email']}
                />
                {fieldErrors['user_email'] && (
                  <FieldError>{fieldErrors['user_email']}</FieldError>
                )}
              </Field>
              <Field>
                <Label htmlFor="profile-address-search">Adresse</Label>
                {open ? (
                  <div
                    id="profile-address-search"
                    ref={autocompleteContainerRef}
                    className="relative z-10 min-h-9 w-full"
                  />
                ) : null}
              </Field>
            </FieldGroup>
            <DialogFooter className="flex-row items-center justify-between gap-2 sm:flex-row sm:justify-between">
              <Link
                to={`/forgot-password?email=${encodeURIComponent(user.user_email)}`}
                className="text-sm text-primary hover:underline"
              >
                Nulstil adgangskode
              </Link>
              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>
                    Annuller
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  Gem
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={handleConfirmOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gem ændringer?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på, at du vil opdatere dine oplysninger?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {confirmError && (
            <p className="text-sm text-destructive">{confirmError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Fortryd</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmSave();
              }}
            >
              {saving ? 'Gemmer...' : 'Ja, gem ændringer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
