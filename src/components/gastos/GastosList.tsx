import { useGastos } from "../../context/GastosContext";

interface Props {
    onDelete: (id: number) => void
}

export function GastosList({ onDelete }: Props) {
    const { gastos, loading, error } = useGastos()

    if (loading) return (
        <div className="flex justify-center items-center p-8">
            <span className="text-gray-500">Carregando...</span>
        </div>
    )

    if (error) return (
        <div className="p-4 bg-red-100 text-red-600 rounded-lg">
            {error}
        </div>
    )

    if (gastos.length === 0) return (
        <div className="flex justify-center items-center p-8">
            <span className="text-gray-500">Nenhum gasto encontrado</span>
        </div>
    )

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3">Descrição</th>
                        <th className="px-6 py-3">Categoria</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {gastos.map((gasto) => (
                        <tr key={gasto.id} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{gasto.descricao}</td>
                            <td className="px-6 py-4 text-gray-600">{gasto.categoria}</td>
                            <td className="px-6 py-4 text-gray-600">{new Date(gasto.data + "T00:00:00").toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 text-gray-900 font-medium">
                                {gasto.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${gasto.pago === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {gasto.pago === 1 ? 'Pago' : 'Não Pago'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => onDelete(gasto.id!)}
                                    className="text-red-500 hover:text-red-700 font-medium transition-colors">
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}