import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SubmitButton } from './SubmitButton';

describe('SubmitButton', () => {
  it('fica habilitado quando não está enviando', () => {
    render(<SubmitButton>Cadastrar</SubmitButton>);

    const button = screen.getByRole('button', { name: 'Cadastrar' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-busy', 'false');
  });

  it('desabilita e mostra o texto de carregamento enquanto envia', () => {
    render(
      <SubmitButton loading loadingText="Enviando…">
        Cadastrar
      </SubmitButton>,
    );

    const button = screen.getByRole('button', { name: /enviando/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('não dispara um segundo envio enquanto carrega', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SubmitButton loading>Salvar</SubmitButton>
      </form>,
    );

    await userEvent.setup().click(screen.getByRole('button'));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
