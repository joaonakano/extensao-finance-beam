import { useState } from 'react'
import { useMeiosPagamento, MeioPagamento } from '../../context/MeiosPagamentoContext'

export const TIPOS_PAGAMENTO = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'Pix' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' },
    { value: 'transferencia', label: 'Transferência Bancária' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'outro', label: 'Outro' },
]

interface FormData {
    descricao: string
    tipo: string
    status: 'ativo' | 'inativo'
}

interface FormErrors {
    descricao?: string
    tipo?: string
}

interface Props {
    initialData?: MeioPagamento   // quando presente = modo edição
    onSuccess: () => void
    onCancel: () => void
}

function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null
    return (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {msg}
        </p>
    )
}

export function MeiosPagamentoForm({ initialData, onSuccess, onCancel }: Props) {
    const { createMeio, updateMeio } = useMeiosPagamento()
    const isEdit = !!initialData?.id

    const [form, setForm] = useState<FormData>({
        descricao: initialData?.descricao ?? '',
        tipo: initialData?.tipo ?? '',
        status: initialData?.status ?? 'ativo',
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [loading, setLoading] = useState(false)

    function validar(): boolean {
        const novosErros: FormErrors = {}

        if (!form.descricao.trim()) {
            novosErros.descricao = 'Descrição é obrigatória.'
        } else if (form.descricao.trim().length < 2) {
            novosErros.descricao = 'Descrição deve ter pelo menos 2 caracteres.'
        } else if (form.descricao.trim().length > 100) {
            novosErros.descricao = 'Descrição deve ter no máximo 100 caracteres.'
        }

        if (!form.tipo) {
            novosErros.tipo = 'Tipo é obrigatório.'
        }

        setErrors(novosErros)
        return Object.keys(novosErros).length === 0
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validar()) return

        setLoading(true)
        let result: { success: boolean; error?: string }

        if (isEdit) {
            result = await updateMeio({
                id: initialData!.id!,
                descricao: form.descricao.trim(),
                tipo: form.tipo,
                status: form.status,
            })
        } else {
            result = await createMeio({
                descricao: form.descricao.trim(),
                tipo: form.tipo,
                status: form.status,
            })
        }

        setLoading(false)
        if (result.success) onSuccess()
    }

    const inputBase = 'w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    const inputNormal = 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
    const inputError = 'border-red-400 bg-red-50 text-red-900 placeholder-red-300'

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Descrição / Nome */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Descrição / Nome <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    placeholder="Ex: Cartão Nubank, Conta Corrente..."
                    maxLength={100}
                    className={`${inputBase} ${errors.descricao ? inputError : inputNormal}`}
                />
                <div className="flex items-start justify-between mt-1.5">
                    <ErrorMsg msg={errors.descricao} />
                    <span className="text-xs text-gray-400 ml-auto">{form.descricao.length}/100</span>
                </div>
            </div>

            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo <span className="text-red-500">*</span>
                </label>
                <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.tipo ? inputError : inputNormal}`}
                >
                    <option value="">Selecione um tipo...</option>
                    {TIPOS_PAGAMENTO.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
                <ErrorMsg msg={errors.tipo} />
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex gap-3">
                    {(['ativo', 'inativo'] as const).map((s) => (
                        <label
                            key={s}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors select-none ${
                                form.status === s
                                    ? s === 'ativo'
                                        ? 'border-green-400 bg-green-50 text-green-800'
                                        : 'border-gray-400 bg-gray-50 text-gray-700'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            <input type="radio" name="status" value={s} checked={form.status === s} onChange={handleChange} className="sr-only" />
                            <span className={`w-2 h-2 rounded-full ${s === 'ativo' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-sm font-medium capitalize">{s}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors">
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Salvando...
                        </>
                    ) : isEdit ? 'Salvar alterações' : 'Salvar'}
                </button>
            </div>
        </form>
    )
}
