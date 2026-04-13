import { useGastos } from '../context/GastosContext'
import { Header } from '../components/Header'

export function Dashboard() {
  const { gastos } = useGastos()

  // Calcular resumos
  const hoje = new Date().toISOString().split('T')[0]
  const inicioSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const totalHoje = gastos
    .filter(g => g.data === hoje)
    .reduce((sum, g) => sum + g.total, 0)

  const totalSemana = gastos
    .filter(g => g.data >= inicioSemana)
    .reduce((sum, g) => sum + g.total, 0)

  const totalMes = gastos
    .filter(g => g.data >= inicioMes)
    .reduce((sum, g) => sum + g.total, 0)

  const totalGeral = gastos.reduce((sum, g) => sum + g.total, 0)

  // Agrupar por categoria
  const porCategoria = gastos.reduce((acc, g) => {
    const cat = g.categoria || 'Outros'
    acc[cat] = (acc[cat] || 0) + g.total
    return acc
  }, {} as Record<string, number>)

  // Últimos 5 gastos
  const ultimosGastos = gastos.slice(0, 5)

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Dashboard" subtitle="Visão geral dos seus gastos" />

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Hoje</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalHoje)}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalSemana)}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalMes)}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Geral</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalGeral)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gastos por Categoria */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Gastos por Categoria</h2>
            <div className="space-y-4">
              {Object.entries(porCategoria).length > 0 ? (
                Object.entries(porCategoria)
                  .sort((a, b) => b[1] - a[1])
                  .map(([categoria, total]) => {
                    const percentual = (total / totalGeral) * 100
                    return (
                      <div key={categoria}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{categoria}</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <p className="text-gray-500 text-center py-8">Nenhum gasto registrado</p>
              )}
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Estatísticas</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total de Gastos</p>
                <p className="text-2xl font-bold text-gray-900">{gastos.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(porCategoria).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(gastos.length > 0 ? totalGeral / gastos.length : 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maior Gasto</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(gastos.length > 0 ? Math.max(...gastos.map(g => g.total)) : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos Gastos */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Últimos Gastos</h2>
          {ultimosGastos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Descrição</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Categoria</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Data</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ultimosGastos.map((gasto) => (
                    <tr key={gasto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">{gasto.descricao}</td>
                      <td className="px-6 py-4 text-gray-600">{gasto.categoria}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(gasto.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(gasto.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum gasto registrado</p>
          )}
        </div>
      </div>
    </div>
  )
}
