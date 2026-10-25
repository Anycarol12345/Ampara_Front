import {
  cloneElement,
  createContext,
  useContext,
  useId,
  type ComponentProps,
  type ReactElement,
} from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/ui/label';

const Form = FormProvider;

interface FormFieldContextValue {
  name: string;
}
interface FormItemContextValue {
  id: string;
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const field = useContext(FormFieldContext);
  const item = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: field.name });

  if (!field.name) throw new Error('useFormField deve ser usado dentro de <FormField>');

  const state = getFieldState(field.name, formState);
  return {
    ...state,
    name: field.name,
    formItemId: `${item.id}-form-item`,
    formDescriptionId: `${item.id}-form-item-description`,
    formMessageId: `${item.id}-form-item-message`,
  };
}

function FormItem({ className, ...props }: ComponentProps<'div'>) {
  const id = useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('grid gap-2', className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

interface ControlProps {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** Liga o campo (Input, Textarea...) ao label e às mensagens de erro. Recebe um único elemento. */
function FormControl({ children }: { children: ReactElement }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return cloneElement(children as ReactElement<ControlProps>, {
    id: formItemId,
    'aria-describedby': error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId,
    'aria-invalid': !!error,
  });
}

function FormDescription({ className, ...props }: ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();
  return (
    <p
      id={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function FormMessage({ className, children, ...props }: ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;
  if (!body) return null;
  return (
    <p
      id={formMessageId}
      role="alert"
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
