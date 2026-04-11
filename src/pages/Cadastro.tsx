import { useState } from "react";
import { RegisterResponse, CheckEmailResponse } from "../types/api";

interface CadastroForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

interface CadastroErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  geral?: string;
}

interface Props {
  onCadastro: () => void;
  onIrParaLogin: () => void;
}

function getForcaSenha(senha: string): { nivel: number; label: string; cor: string } {
  if (!senha) return { nivel: 0, label: "", cor: "" };

  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (/[A-Z]/.test(senha)) pontos++;
  if (/[0-9]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;

  if (pontos <= 1) return { nivel: 1, label: "Fraca", cor: "bg-red-400" };
  if (pontos === 2) return { nivel: 2, label: "Média", cor: "bg-yellow-400" };
  if (pontos === 3) return { nivel: 3, label: "Boa", cor: "bg-blue-400" };
  return { nivel: 4, label: "Forte", cor: "bg-green-500" };
}

export function Cadastro({ onCadastro, onIrParaLogin }: Props) {
  const [form, setForm] = useState<CadastroForm>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [errors, setErrors] = useState<CadastroErrors>({});
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const forcaSenha = getForcaSenha(form.senha);

  async function validar(): Promise<boolean> {
    const novosErros: CadastroErrors = {};

    if (!form.nome.trim()) {
      novosErros.nome = "Nome é obrigatório.";
    } else if (form.nome.trim().length < 2) {
      novosErros.nome = "Nome deve ter pelo menos 2 caracteres.";
    } else if (form.nome.trim().split(" ").length < 2) {
      novosErros.nome = "Informe nome e sobrenome.";
    }

    if (!form.email.trim()) {
      novosErros.email = "E-mail é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = "Informe um e-mail válido.";
    } else {
      // Verificar se email já existe
      try {
        const response: CheckEmailResponse = await window.api.auth.checkEmail(form.email);
        if (response.exists) {
          novosErros.email = "Este e-mail já está cadastrado.";
        }
      } catch (error) {
        console.error("Erro ao verificar email:", error);
      }
    }

    if (!form.senha) {
      novosErros.senha = "Senha é obrigatória.";
    } else if (form.senha.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    if (!form.confirmarSenha) {
      novosErros.confirmarSenha = "Confirmação de senha é obrigatória.";
    } else if (form.senha !== form.confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CadastroErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!(await validar())) return;

    setLoading(true);
    setErrors({});

    try {
      const response: RegisterResponse = await window.api.auth.register(
        form.nome,
        form.email,
        form.senha
      );

      if (response.success) {
        // Cadastro bem-sucedido
        setTimeout(() => {
          onCadastro();
        }, 1500);
      } else {
        setErrors({ geral: response.error || "Erro ao criar conta" });
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setErrors({ geral: "Erro ao conectar com o servidor" });
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const inputNormal = "border-gray-300 bg-white text-gray-900 placeholder-gray-400";
  const inputError = "border-red-400 bg-red-50 text-red-900 placeholder-red-300";

  function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {msg}
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cadastro</h1>
          <p className="text-sm text-gray-500 mt-1">Finance Beam</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Erro Geral */}
          {errors.geral && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-red-700">{errors.geral}</span>
            </div>
          )}

          {/* Sucesso */}
          {!loading && !errors.geral && Object.keys(errors).length === 0 && form.email && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-700">Cadastro realizado com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="João da Silva"
                autoComplete="name"
                className={`${inputBase} ${errors.nome ? inputError : inputNormal}`}
              />
              <ErrorMsg msg={errors.nome} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                autoComplete="email"
                className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
              />
              <ErrorMsg msg={errors.email} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${inputBase} pr-10 ${errors.senha ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarSenha ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {form.senha && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= forcaSenha.nivel ? forcaSenha.cor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    forcaSenha.nivel === 1 ? "text-red-500" :
                    forcaSenha.nivel === 2 ? "text-yellow-500" :
                    forcaSenha.nivel === 3 ? "text-blue-500" : "text-green-600"
                  }`}>
                    Senha {forcaSenha.label}
                  </p>
                </div>
              )}
              <ErrorMsg msg={errors.senha} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  name="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${inputBase} pr-10 ${errors.confirmarSenha ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarConfirmar ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {form.confirmarSenha && form.senha && !errors.confirmarSenha && (
                <p className={`mt-1.5 text-xs flex items-center gap-1 ${
                  form.senha === form.confirmarSenha ? "text-green-600" : "text-gray-400"
                }`}>
                  {form.senha === form.confirmarSenha ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Senhas coincidem
                    </>
                  ) : null}
                </p>
              )}
              <ErrorMsg msg={errors.confirmarSenha} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">Já tem uma conta?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onIrParaLogin}
            className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            Entrar na conta
          </button>
        </div>
      </div>
    </div>
  );
}
