import { Input } from '@/components/ui/input';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

type AuthFormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
};

export const AuthFormField = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  disabled,
  required,
  autoComplete,
}: AuthFormFieldProps) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={cn(
            'w-full rounded-lg border border-input bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring',
            error && 'border-destructive focus:ring-destructive/30',
          )}
        />
        {error ? (
          <FieldError id={errorId} errors={[{ message: error }]} />
        ) : null}
      </FieldContent>
    </Field>
  );
};

export const AuthFormBanner = ({
  variant,
  children,
}: {
  variant: 'error' | 'success';
  children: React.ReactNode;
}) => {
  const classes =
    variant === 'success'
      ? 'text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center'
      : 'text-sm text-destructive bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center';

  return (
    <p role={variant === 'error' ? 'alert' : 'status'} className={classes}>
      {children}
    </p>
  );
};
