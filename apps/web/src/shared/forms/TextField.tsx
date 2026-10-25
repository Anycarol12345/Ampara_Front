import type { ComponentProps } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

interface TextFieldProps<T extends FieldValues> extends Omit<
  ComponentProps<typeof Input>,
  'name' | 'value' | 'defaultValue' | 'onChange'
> {
  name: FieldPath<T>;
  label: string;
  description?: string;
  /** Formata o texto enquanto o usuário digita (ex.: maskCpf). */
  mask?: (value: string) => string;
}

/** Deve ser usado dentro de <Form {...form}>: pega o control do contexto. */
export function TextField<T extends FieldValues>({
  name,
  label,
  description,
  mask,
  ...inputProps
}: TextFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...inputProps}
              {...field}
              value={(field.value as string | undefined) ?? ''}
              onChange={(event) =>
                field.onChange(mask ? mask(event.target.value) : event.target.value)
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
