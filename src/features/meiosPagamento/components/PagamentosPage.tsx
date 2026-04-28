import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export function PagamentosPage() {
    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Meios de Pagamento</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Gerencie os Cadastros de Meios de Pagamento.</p>
                </div>
                <Button >
                    <Plus className="size-4" />
                    Novo Meio de Pagamento
                </Button>
            </div>

            {/* Tabela */}
            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                                Nenhum meio de pagamento registrado. Clique em "Novo Meio de Pagamento" para começar.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}