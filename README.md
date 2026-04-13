# Projeto de Extensão: Finance Beam

A proposta do presente projeto é a entrega final de software para auxiliar os processos internos da empresa Faça a Festa, de Guarapuava - PR, como objetivo avaliativo da disciplina de Extensão do 7° Período do curso de Engenharia de Software, Centro Universitário Campo Real.

A ideia central é auxiliar no controle de gastos da empresa através de software instalado localmente nas máquinas do cliente. O controle de gastos será feito através da criação e acompanhamento do módulo de Contas a Pagar.

## Requisitos 

- [Node.js](https://nodejs.org/) versão 18 ou superior
- NPM versão 9 ou superior
- Git

## Instalação

Se você é desenvolvedor e planeja executar o código-fonte do projeto, é necessária a instalação prévia de todos os pré-requisitos. Siga as instruções:

1. Clone o Repositório:
```bash
git clone https://github.com/joaonakano/extensao-finance-beam.git
cd extensao-finance-beam
```

2. Instale as Dependências:
```bash
npm install
```

3. Reconstrua os Módulos do Electron:
```bash
npx electron-rebuild
```

## Executando o Programa

```bash
npm run dev
```

## Stacks Utilizadas

- **Electron** - aplicativo desktop
- **React + TypeScript** - frontend UI
- **Vite** - framework de build para aplicativo instalado
- **SQLite (better-sqlite3)** - banco de dados local
- **Tailwind CSS** - estilização
