import { useState } from "react";
import { useGastos } from "../context/GastosContext";
import { GastosList } from "../components/gastos/GastosList";
import { GastosForm } from "../components/gastos/GastosForm";
import { GastosDeleteModal } from "../components/gastos/GastosDeleteModal";
import { Header } from "../components/Header";

export function Gastos() {
  const { deleteGasto } = useGastos()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function handleConfirmacaoDelete() {
    if (deleteId === null) return
    await deleteGasto(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Meus Gastos" subtitle="Gerencie seus gastos e despesas" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Botão para mostrar/esconder formulário */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {showForm ? '✕ Cancelar' : '+ Novo Gasto'}
            </button>
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="mb-8">
              <GastosForm onSuccess={() => setShowForm(false)} />
            </div>
          )}

          {/* Lista de Gastos */}
          <GastosList onDelete={(id) => setDeleteId(id)} />
        </div>
      </div>

      <GastosDeleteModal
        isOpen={deleteId !== null}
        onConfirm={handleConfirmacaoDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
