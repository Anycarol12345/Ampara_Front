import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Form } from '@/shared/ui/form';
import { maskCpf } from './masks';
import { cpfSchema } from './schemas';
import { TextField } from './TextField';

const schema = z.object({ cpf: cpfSchema });

function Harness() {
  const form = useForm<{ cpf: string }>({
    resolver: zodResolver(schema),
    defaultValues: { cpf: '' },
    mode: 'onTouched',
  });

  return (
    <Form {...form}>
      <form noValidate>
        <TextField name="cpf" label="CPF" mask={maskCpf} />
      </form>
    </Form>
  );
}

describe('TextField', () => {
  it('aplica a máscara enquanto o usuário digita', async () => {
    render(<Harness />);
    const input = screen.getByLabelText('CPF');

    await userEvent.setup().type(input, '52998224725');

    expect(input).toHaveValue('529.982.247-25');
  });

  it('mostra o erro de validação ao sair do campo e marca o campo como inválido', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('CPF');

    await user.type(input, '111');
    await user.tab();

    expect(await screen.findByRole('alert')).toHaveTextContent('CPF inválido');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
