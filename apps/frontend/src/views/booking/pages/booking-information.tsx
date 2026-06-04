import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import {
  useBooking,
  useBookingStepFooter,
} from '@/views/booking/booking-context';
import { isInformationStepComplete } from '@/views/booking/booking-guards';

export const InformationPage = () => {
  const { draft, setDraft } = useBooking();

  useBookingStepFooter({
    disabled: !isInformationStepComplete(draft),
    label: 'Fortsæt',
  });

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => e.preventDefault()}
            aria-label="Bookingoplysninger"
          >
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="booking-comments">Kommentar</FieldLabel>
                <Textarea
                  id="booking-comments"
                  placeholder="Kommentar (ønsket hårfarve, allergier osv.)"
                  value={draft.comments ?? ''}
                  onChange={(e) => setDraft({ comments: e.target.value })}
                  rows={5}
                />
              </Field>
              <div className="flex items-start justify-start gap-3 pt-2">
                <Checkbox
                  id="booking-policy"
                  checked={draft.policyAccepted ?? false}
                  onCheckedChange={(checked) =>
                    setDraft({ policyAccepted: checked === true })
                  }
                />
                <FieldLabel
                  htmlFor="booking-policy"
                  className="max-w-sm text-right font-normal leading-snug text-muted-foreground"
                >
                  Accepter vilkår og betingelser
                </FieldLabel>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
