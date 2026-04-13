import { useState } from "react";
import { useGastos } from "../../context/GastosContext";

const CATEGORIAS = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Moradia',
    'Outros',
]

interface GastosFormProps {
    onSuccess?: () => void
}

export function GastosForm({ onSuccess }: GastosFormProps) {
    const { createGasto } = useGastos()
    const [form, setForm] = useState({
        descricao: '',
        total: '',
        categoria: '',
        data: '',
        pago: 0,
    })

    const [errors, setErrors] = useState({
        descricao: '',
        total: '',
        categoria: '',
        data: '',
    })

    function validate() {
        const newErrors = { descricao: '', total: '', categoria: '', data: '' }
        let valid = true

        if (!form.descricao.trim()) {
            newErrors.descricao = 'Descrição é obrigatória'
            valid = false
        }

        if (!form.total || parseFloat(form.total) <= 0) {
            newErrors.total = 'Total deve ser maior que zero'
            valid = false
        }

        if (!form.categoria.trim()) {
            newErrors.categoria = 'Categoria é obrigatória'
            valid = false
        }

        if (!form.data) {
            newErrors.data = 'Data é obrigatória'
            valid = false
        } else {
            const data = new Date(form.data)
            const dataMin = new Date('1900-01-01')
            
            if (isNaN(data.getTime())) {
                newErrors.data = 'Data inválida'
                valid = false
            } else if (data < dataMin) {
                newErrors.data = 'Data muito antiga, insira uma data válida'
                valid = false
            }
        }

        setErrors(newErrors)
        return valid
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!validate()) return

        await createGasto({
            descricao: form.descricao,
            total: parseFloat(form.total),
            categoria: form.categoria,
            data: form.data,
            pago: form.pago,
        })

        // Resetar formulario
        setErrors({ descricao: '', total: '', categoria: '', data: '' })
        setForm({ descricao: '', total: '', categoria: '', data: '', pago: 1 })
        onSuccess?.()
    }

    return(
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Novo Gasto</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                    </label>
                    <input type="text" name="descricao" value={form.descricao} onChange={handleChange} placeholder="Ex: Compra de Material" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></input>
                    {errors.descricao && (
                        <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total (R$)
                    </label>
                    <input
                        type="number"
                        name="total"
                        value={form.total}
                        onChange={handleChange}
                        placeholder="0,00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()}
                    />
                    {errors.total && (
                        <p className="text-red-500 text-xs mt-1">{errors.total}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria
                    </label>
                    <select
                        name="categoria"
                        value={form.categoria}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione...</option>
                        {CATEGORIAS.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.categoria && (
                        <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
                    )}
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data
                    </label>
                    <input
                        type="date"
                        name="data"
                        value={form.data}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    {errors.data && (
                        <p className="text-red-500 text-xs mt-1">{errors.data}</p>
                    )}
                </div>

                <div className="col-span-2 flex items-center justify-center gap-2">
                    <input type="checkbox" id="pago" checked={form.pago == 1} onChange={(e) => setForm({ ...form, pago: e.target.checked ? 1 : 0 })} className="w-4 h-4 accent-blue-600"/>
                    <label htmlFor="pago" className="text-sm font-medium text-gray-700">Pago</label>
                </div>
            </div>

            <button
                type="submit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Adicionar Gasto
            </button>
        </form>
    )
}
