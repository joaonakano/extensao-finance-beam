ATENÇÃO, DIRETORIO EM PROCESSO DE REFATORAÇÃO,
LEIA ABAIXO PARA ENTENDER COMO FUNCIONARÁ O ESQUEMA DE PARTIÇÕES E ASSIM CODIFICAR DE ACORDO

API         -> Comunicação com os canais iPC
ACTIONS     -> Escrita e padronização de dados
HOOKS       -> Leitura de dados
COMPONENTS  -> UI pura e reutilizável
DIALOGS     -> Ações e popups   (CreateExpenseDialog)
FORMS       -> Entrada de dados (CreateExpenseForm)
SCHEMAS     -> Validação (zod), regras de input e saneamento
UTILS       -> Formatação, helpers gerais, cálculos simples
PAGES       -> Montar a tela (chamar hook, renderizar tabelas, etc)
TYPES       -> Tipos utilizados (Expense, Category, etc)