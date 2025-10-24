# ETP - Estudos Técnicos Preliminares Web

## 1 - Descrição do Projeto

FRONTEND para cadastramento, construção simulação de formulários e dados dinâmicos;

## 2 - Objetivo do Projeto

Projeto FrontEnd responsável por disponibilizar as funcionalidades necessárias para os usuários de forma amigável, de tal maneira que
se possivel gerenciar e criar formulários de Estudo Técnicos Preliminares de forma dinámica, as principais bibliotecas que
permitem tal usabilidade são https://github.com/formio e https://ckeditor.com/

## 3 - Informações Técnicas

Para instalação do formulario-web é necessário executar o seguinte comando:
`npm install`
em caso de erro execute o comando :
`npm install --legacy-peer-deps`  
Uma vez instalado o projeto pode ser construído executando o comando:  
 `ng build`  
Testado com o comando:  
 `ng test --browsers=ChromeNoSandbox --watch=false --source-map=false --code-coverage`  
E executado com o comando:  
 `ng serve`

### 3.1 - Dependências

- Python - 3.12.2
- Angular - 17.3.4
- Node JS - v20.12.1
- Formio - 7.0.0
- Bootstrap - 4
- Administrativo Components 15.2.13
- Administrativo Comum 11.7.11
- Ckeditor5-angular 7.0.1

## 4 - Como utilizar

### 4.1 - SWAGGER

- O acesso ao swagger em ambiente de desenvolvimento deve ser efetuado no endereço `https://formulario-etp-dev.web.stj.jus.br/api/formulario-etp-service/swagger-ui.html` podendo também ser acessada na máquina do desenvolvedor, quando executado o backend, em `http://localhost:8080/api/formulario-etp-service/swagger-ui.html`
  Na página estarão publicados as APIs de serviços disponíveis, com informações a respeito dos campos utilizados, obrigatoriedade, tipo de dado esperado e de resultado da solicitação.
  Há também a possibilidade de realização de testes diretamente da página do Swagger nas APIs de serviços, onde também podem ser obtidos exemplos de requisições e seus métodos de execução (GET, POST, PUT, etc.)

### 4.2 - OUTRO FORMA DE ACESSO

- O acesso à aplicação pode ser feita própria máquina do desenvolvedor em `http://localhost:4200/etp-web`

- Em ambiente de desenvolvimento, o acesso é feito no endereço `https://formulario-etp-dev.web.stj.jus.br/formulario-web/`

### 4.3 - OPERAÇÕES DA API

- Assunto (Gerencia Assuntos):  
   GET /assunto (Lista assuntos paginado)  
   POST /assunto (Criar novo assunto)  
   GET /assunto/{idAssunto} (Buscar um assunto)  
   PUT /assunto/{idAssunto} (Atualização do assunto)  
   DELETE /assunto/{idAssunto} (Excluir assunto)  
   GET /assunto/lista (Lista todos assuntos)

- Formulário (Gerencia Formulários):  
   GET /formulario (Lista formulários)  
   POST /formulario (Criar novo formulário)  
   GET /formulario/{idFormulario} (Buscar um formulário)  
   PUT /formulario/{idFormulario} (Atualização do formulário)  
   DELETE /formulario/{idFormulario} (Excluir formulário)  
   PATCH /formulario/{idFormulario} (Atualização do formulário)  
   POST /formulario/copiar/{idFormulario} (Copiar formulário)  
   POST /formulario/versionar/{idFormulario} (Versionar formulário)

- Situação (Gerencia Situações):  
   GET /situacao (Lista situações paginado)  
   POST /situacao (Criar nova situação)  
   GET /situacao/{idSituacao} (Buscar uma situação)  
   PUT /situacao/{idSituacao} (Atualização da situação)  
   DELETE /situacao/{idSituacao} (Excluir situação)  
   GET /situacao/lista (Lista todas situações)
-
- DadosFormulário
  POST /formulario/gerador-pdf (Gerador de PDF para Template HTML)

## 5 - Configurações

### 5.1 - Configuração package.json:

Nome do projeto: "formulario-web"  
Versão: "1.1.2-SNAPSHOT"

## 6 - Execução

A execução em ambiente local é feita após a execução do seguinte comando:  
`ng serve`  
Seu acesso é feito em : `http://localhost:4200/etp-web`

## 7 - Documentação

### 7.1 - Documentação do projeto.

(à fazer)

## fim
