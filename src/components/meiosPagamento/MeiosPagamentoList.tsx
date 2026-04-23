import { useState, useRef, useEffect } from 'react'
import { useMeiosPagamento, MeioPagamento } from '../../context/MeiosPagamentoContext'
import { TIPOS_PAGAMENTO } from './MeiosPagamentoForm'

const TIPO_ICONS: Record<string, string> = {
    dinheiro: '💵',
    pix: '⚡',
    boleto: '📄',
    cartao_credito: '💳',
    cartao_debito: '💳',
    transferencia: '🏦',
    cheque: '📝',
    outro: '💰',
}

function getTipoLabel(value: string) {
    return TIPOS_PAGAMENTO.find((t) => t.value === value)?.label ?? value
}

const PAGE_SIZE = 8

interface Props {
    onEdit: (meio: MeioPagamento) => void
    onDelete: (id: number) => void
    onToggle: (id: number) => void
}

function RowMenu({
    meio,
    onEdit,
    onDelete,
    onToggle,
}: {
    meio: MeioPagamento
    onEdit: () => void
    onDelete: () => void
    onToggle: () => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Ações"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
                    <button
                        onClick={() => { setOpen(false); onEdit() }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                    </button>

                    <button
                        onClick={() => { setOpen(false); onToggle() }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {meio.status === 'ativo' ? (
                            <>
                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Inativar
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ativar
                            </>
                        )}
                    </button>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                        onClick={() => { setOpen(false); onDelete() }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir
                    </button>
                </div>
            )}
        </div>
    )
}

export function MeiosPagamentoList({ onEdit, onDelete, onToggle }: Props) {
    const { meios, loading, error } = useMeiosPagamento()
    const [page, setPage] = useState(1)

    useEffect(() => { setPage(1) }, [meios.length])

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
        )
    }

    if (meios.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 rounded-lg">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <span className="text-2xl">💳</span>
                </div>
                <p className="text-gray-500 text-sm font-medium">Nenhum meio de pagamento cadastrado</p>
                <p className="text-gray-400 text-xs mt-1">Clique em "Novo Meio de Pagamento" para começar.</p>
            </div>
        )
    }

    const totalPages = Math.ceil(meios.length / PAGE_SIZE)
    const paginated = meios.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400">
                {meios.length} {meios.length === 1 ? 'registro' : 'registros'} no total
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginated.map((meio) => (
                            <tr
                                key={meio.id}
                                className={`transition-colors ${
                                    meio.status === 'inativo'
                                        ? 'bg-gray-50 opacity-60 hover:opacity-80'
                                        : 'bg-white hover:bg-gray-50'
                                }`}
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">{meio.descricao}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    <span className="flex items-center gap-1.5">
                                        <span>{TIPO_ICONS[meio.tipo] ?? '💰'}</span>
                                        {getTipoLabel(meio.tipo)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onToggle(meio.id!)}
                                        title={meio.status === 'ativo' ? 'Clique para inativar' : 'Clique para ativar'}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70 cursor-pointer ${
                                            meio.status === 'ativo'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${meio.status === 'ativo' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {meio.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <RowMenu
                                        meio={meio}
                                        onEdit={() => onEdit(meio)}
                                        onDelete={() => onDelete(meio.id!)}
                                        onToggle={() => onToggle(meio.id!)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">Página {page} de {totalPages}</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(1)} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Primeira">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Anterior">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...')
                                acc.push(p)
                                return acc
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`e${idx}`} className="px-1 text-gray-400 text-xs">…</span>
                                ) : (
                                    <button key={item} onClick={() => setPage(item as number)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === item ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                        {item}
                                    </button>
                                )
                            )}

                        <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Próxima">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Última">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
