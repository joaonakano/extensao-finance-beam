import { useState } from 'react'
import { MeiosPagamentoForm } from '../components/meiosPagamento/MeiosPagamentoForm'
import { MeiosPagamentoList } from '../components/meiosPagamento/MeiosPagamentoList'
import { useMeiosPagamento, MeioPagamento } from '../context/MeiosPagamentoContext'
import { ToastContainer, useToast } from '../components/Toast'

export function MeiosPagamento() {
    const { deleteMeio, toggleStatus } = useMeiosPagamento()
    const { toasts, toast, removeToast } = useToast()

    // Controle de formulário: null = oculto, undefined = criação, MeioPagamento = edição
    const [formData, setFormData] = useState<MeioPagamento | null | undefined>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const showForm = formData !== null
    const isEdit = showForm && formData !== undefined

    // --- Handlers de criação/edição ---
    async function handleSuccess() {
        setFormData(null)
        toast.success(isEdit ? 'Meio de pagamento atualizado com sucesso!' : 'Meio de pagamento criado com sucesso!')
    }

    // --- Toggle ativo/inativo ---
    async function handleToggle(id: number) {
        const result = await toggleStatus(id)
        if (result.success) {
            toast.success('Status atualizado.')
        } else {
            toast.error(result.error ?? 'Erro ao alterar status.')
        }
    }

    // --- Delete com validação de transações ---
    async function handleConfirmDelete() {
        if (deleteId === null) return
        setDeleteLoading(true)
        const result = await deleteMeio(deleteId)
        setDeleteLoading(false)

        if (result.success) {
            toast.success('Meio de pagamento excluído.')
            setDeleteId(null)
        } else {
            toast.error(result.error ?? 'Erro ao excluir meio de pagamento.')
            setDeleteId(null)
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meios de Pagamento</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Gerencie os meios de pagamento disponíveis.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setFormData(undefined)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Novo Meio de Pagamento
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {/* Formulário de criação / edição */}
                {showForm && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {isEdit ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
                            </h2>
                            {isEdit && formData && (
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                    Editando: <span className="font-medium text-gray-600">{(formData as MeioPagamento).descricao}</span>
                                </span>
                            )}
                        </div>
                        <MeiosPagamentoForm
                            initialData={isEdit ? (formData as MeioPagamento) : undefined}
                            onSuccess={handleSuccess}
                            onCancel={() => setFormData(null)}
                        />
                    </div>
                )}

                {/* Lista */}
                <MeiosPagamentoList
                    onEdit={(meio) => setFormData(meio)}
                    onDelete={(id) => setDeleteId(id)}
                    onToggle={handleToggle}
                />
            </div>

            {/* Modal de confirmação de exclusão */}
            {deleteId !== null && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Confirmar exclusão</h3>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Não será possível excluir se houver transações vinculadas.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={deleteLoading}
                                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Excluindo...
                                    </>
                                ) : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    )
}
