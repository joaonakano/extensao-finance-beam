interface Props {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
}

export function GastosDeleteModal({ isOpen, onConfirm, onCancel }: Props) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Excluir gasto</h3>

                <p className="text-gray-600 text-sm mb-6">Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.</p>
                
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    )
}