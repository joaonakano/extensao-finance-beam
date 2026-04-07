import { useState } from "react";
import { useGastos } from "../context/GastosContext";
import { GastosList } from "../components/gastos/GastosList";
import { GastosForm } from "../components/gastos/GastosForm";
import { GastosDeleteModal } from "../components/gastos/GastosDeleteModal";

export function Gastos() { 
    const { deleteGasto } = useGastos()
    const [deleteId, setDeleteId] = useState<number | null>(null)

    async function handleConfirmacaoDelete() {
        if (deleteId === null) return
        await deleteGasto(deleteId)
        setDeleteId(null)
    }

    return (
        <div className="p-6 max-w-5x1 mx-auto">
            <h1 className="text-2x1 font-bold text-gray-900 mb-6">Gastos</h1>

            <div className="flex flex-col gap-6">
                <GastosForm />
                <GastosList onDelete={(id) => setDeleteId(id)} />
            </div>

            <GastosDeleteModal
                isOpen={deleteId !== null}
                onConfirm={handleConfirmacaoDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    )
}