import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createWrapper, usuarioTeste } from '@/test/render';
import { ROLE } from './roles';
import { usePermissao } from './usePermissao';

describe('usePermissao', () => {
  it('libera quando o perfil está na lista', () => {
    const { result } = renderHook(() => usePermissao(), {
      wrapper: createWrapper({ sessao: usuarioTeste(ROLE.GESTOR) }),
    });

    expect(result.current.pode([ROLE.GESTOR, ROLE.FUNCIONARIO])).toBe(true);
    expect(result.current.pode([ROLE.ADMIN])).toBe(false);
  });

  it('ignora diferença entre maiúsculas e minúsculas', () => {
    const { result } = renderHook(() => usePermissao(), {
      wrapper: createWrapper({ sessao: usuarioTeste('gestor') }),
    });

    expect(result.current.pode([ROLE.GESTOR])).toBe(true);
  });

  it('sem sessão, nunca libera', () => {
    const { result } = renderHook(() => usePermissao(), { wrapper: createWrapper() });

    expect(result.current.role).toBeNull();
    expect(result.current.pode([ROLE.CLIENTE])).toBe(false);
  });
});
