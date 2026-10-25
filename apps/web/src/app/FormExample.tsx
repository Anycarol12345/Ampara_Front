import { ApiError } from '@ampara/api-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  applyApiErrors,
  birthDateSchema,
  cepSchema,
  cpfSchema,
  emailSchema,
  maskCep,
  maskCpf,
  maskPhone,
  maskUf,
  passwordSchema,
  phoneSchema,
  SubmitButton,
  TextField,
  useCepLookup,
} from '@/shared/forms';
import { Form } from '@/shared/ui/form';

const required = (message: string) => z.string().trim().min(1, message);

const cadastroSchema = z
  .object({
    nome: required('Informe o nome completo'),
    cpf: cpfSchema,
    dataNascimento: birthDateSchema,
    email: emailSchema,
    telefone: phoneSchema,
    senha: passwordSchema,
    confirmarSenha: z.string().min(1, 'Confirme a senha'),
    cep: cepSchema,
    logradouro: required('Informe o logradouro'),
    numero: required('Informe o número'),
    complemento: z
      .string()
      .trim()
      .transform((v) => v || undefined),
    bairro: required('Informe o bairro'),
    cidade: required('Informe a cidade'),
    uf: z.string().length(2, 'Use a sigla com 2 letras'),
  })
  .refine((v) => v.senha === v.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não conferem',
  });

type CadastroInput = z.input<typeof cadastroSchema>; // o que o usuário digita
type CadastroOutput = z.output<typeof cadastroSchema>; // o que vai para a API

const DEFAULTS: CadastroInput = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  email: '',
  telefone: '',
  senha: '',
  confirmarSenha: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

const CEP_HINT = {
  idle: undefined,
  found: undefined,
  loading: 'Buscando endereço…',
  notFound: 'CEP não encontrado. Preencha o endereço manualmente.',
  error: 'Não foi possível buscar o CEP agora. Preencha manualmente.',
} as const;

/** Exemplo de referência (rota temporária /design/formulario). Remover quando houver formulários reais. */
export function FormExample() {
  const form = useForm<CadastroInput, unknown, CadastroOutput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: DEFAULTS,
    mode: 'onTouched',
  });

  // Simula o backend: o CPF 529.982.247-25 devolve erros 400 por campo.
  const cadastrar = useMutation({
    mutationFn: async (data: CadastroOutput) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (data.cpf === '52998224725') {
        throw new ApiError(400, {
          title: 'Um ou mais erros de validação ocorreram.',
          errors: { Cpf: ['Já existe um cliente com este CPF.'], Email: ['E-mail já cadastrado.'] },
        });
      }
      return data;
    },
    // O formulário mostra os erros nos campos; sem isso o toast global apareceria junto.
    meta: { silentError: true, successMessage: 'Cadastro enviado' },
  });

  const cep = useWatch({ control: form.control, name: 'cep' });
  const cepStatus = useCepLookup(cep, (address) => {
    const fill = (name: 'logradouro' | 'bairro' | 'cidade' | 'uf', value: string) => {
      if (value) form.setValue(name, value, { shouldValidate: true, shouldDirty: true });
    };
    fill('logradouro', address.logradouro);
    fill('bairro', address.bairro);
    fill('cidade', address.cidade);
    fill('uf', address.uf);
    form.setFocus('numero');
  });

  // Retorna a promise: isSubmitting fica true até a resposta chegar.
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await cadastrar.mutateAsync(data);
      form.reset();
    } catch (error) {
      applyApiErrors(form, error);
    }
  });

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="section-title">Cadastro de cliente</h1>

      <Form {...form}>
        <form onSubmit={onSubmit} noValidate className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField name="nome" label="Nome completo" autoComplete="name" />
            </div>
            <TextField
              name="cpf"
              label="CPF"
              mask={maskCpf}
              inputMode="numeric"
              placeholder="000.000.000-00"
            />
            <TextField
              name="dataNascimento"
              label="Data de nascimento"
              type="date"
              autoComplete="bday"
            />
            <TextField name="email" label="E-mail" type="email" autoComplete="email" />
            <TextField
              name="telefone"
              label="Telefone"
              mask={maskPhone}
              type="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
            />
            <TextField name="senha" label="Senha" type="password" autoComplete="new-password" />
            <TextField
              name="confirmarSenha"
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="cep"
              label="CEP"
              mask={maskCep}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              description={CEP_HINT[cepStatus]}
            />
            <div className="hidden sm:block" />
            <div className="sm:col-span-2">
              <TextField name="logradouro" label="Logradouro" autoComplete="address-line1" />
            </div>
            <TextField name="numero" label="Número" inputMode="numeric" />
            <TextField name="complemento" label="Complemento (opcional)" />
            <TextField name="bairro" label="Bairro" />
            <TextField name="cidade" label="Cidade" autoComplete="address-level2" />
            <TextField name="uf" label="UF" mask={maskUf} autoComplete="address-level1" />
          </section>

          <SubmitButton loading={form.formState.isSubmitting} loadingText="Enviando…">
            Cadastrar
          </SubmitButton>
        </form>
      </Form>
    </main>
  );
}
