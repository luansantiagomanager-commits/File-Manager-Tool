# File Manager Tool – Sistema de Gestão de Projetos e Tarefas
# **Luan Santiago**

## Sobre o Projeto

Este projeto foi desenvolvido como parte da disciplina **Programação de Soluções Computacionais** (UC Dual – Digital 2026-1) da **Universidade Anhembi Morumbi**. Trata-se de um sistema em console para gerenciamento de projetos, equipes e tarefas, aplicando os princípios do paradigma orientado a objetos e arquitetura em camadas (Model-View-Controller).

O sistema atende três perfis de usuário:
- **Administrador**: gestão de usuários, perfis e integridade do sistema.
- **Gerente de Projetos**: criação e acompanhamento de projetos, atribuição de tarefas, relatórios.
- **Colaborador**: visualização e atualização de suas tarefas.

## Tecnologias Utilizadas

| Componente | Tecnologia |
|------------|------------|
| Linguagem | Java 21 LTS (OpenJDK – Eclipse Temurin) |
| Gerenciador de build | Apache Maven 3.9+ |
| Banco de dados | PostgreSQL 15+ |
| Pool de conexões | HikariCP |
| Logging | SLF4J + Logback |
| Testes unitários | JUnit 5 + Mockito |
| Controle de versão | Git (GitHub) |
| Containerização (opcional) | Docker + Docker Compose |
| IDE recomendada | IntelliJ IDEA Community Edition |

## Estrutura do Projeto (Arquitetura MVC)
src/
├── main/
│ ├── java/
│ │ └── com/manager/
│ │ ├── model/ # Classes de domínio (Usuário, Projeto, Tarefa, Equipe)
│ │ ├── dao/ # Camada de persistência (JDBC + HikariCP)
│ │ ├── controller/ # Lógica de orquestração e regras de negócio
│ │ ├── view/ # Interface em console (menus, formulários)
│ │ └── util/ # Classes auxiliares (conexão, validação)
│ └── resources/
│ ├── logback.xml # Configuração de logging
│ └── application.properties
└── test/ # Testes unitários com JUnit 5 + Mockito

## Princípios de Orientação a Objetos Aplicados

| Princípio | Aplicação no Projeto |
|-----------|----------------------|
| **Abstração** | Modelagem de classes como `Usuario`, `Projeto`, `Tarefa`, `Equipe`, cada uma com atributos e métodos essenciais. |
| **Encapsulamento** | Atributos privados com getters/setters que aplicam validações (ex: impedir status inválido). |
| **Herança** | Classe base `Usuario` com atributos comuns. `Administrador`, `GerenteProjeto` e `Colaborador` herdam e estendem comportamentos específicos. |
| **Polimorfismo** | Método `gerarRelatorio()` implementado de forma diferente em cada tipo de usuário. |

## Funcionalidades Principais

- Cadastro, autenticação e gerenciamento de usuários (administrador, gerente, colaborador)
- Criação e gerenciamento de projetos (status, prazos, equipe associada)
- Criação e atribuição de tarefas a colaboradores
- Acompanhamento de andamento (status: Pendente, Em Andamento, Concluído, Cancelado)
- Relatórios de desempenho (projetos atrasados, carga de trabalho por colaborador)
- Persistência em banco de dados relacional (PostgreSQL)
- Logs estruturados (console e arquivo) com SLF4J + Logback
- Testes unitários para modelo e DAO

## Como Executar o Projeto

### Pré-requisitos

- Java 21 LTS configurado (`JAVA_HOME`)
- Maven 3.9+ instalado
- PostgreSQL 15+ em execução (local ou Docker)
- Git (opcional, para clonar)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/luansantiagomanager-commits/File-Manager-Tool.git
   cd File-Manager-Tool
Configure o banco de dados

Crie um banco de dados PostgreSQL (ex: filemanager_db)

Execute o script SQL de criação das tabelas (localizado em scripts/schema.sql)

Configure as credenciais no arquivo src/main/resources/application.properties

Compile e execute os testes

bash
mvn clean compile
mvn test
Execute a aplicação

bash
mvn exec:java -Dexec.mainClass="com.manager.Main"
Execução com Docker (alternativa)
Caso prefira usar Docker, execute:

bash
docker-compose up -d
Isso subirá uma instância do PostgreSQL 15 com as configurações pré-definidas.

Decisões Técnicas e Justificativas
Java 21 LTS: versão mais recente com suporte estendido, tipagem forte e portabilidade.

Maven: padronização do ciclo de vida (compilação, teste, empacotamento).

PostgreSQL: robusto, ACID, excelente integração com Java via JDBC.

HikariCP: pool de conexões de alto desempenho para aplicações corporativas.

SLF4J + Logback: substitui System.out.println com níveis de log (DEBUG, INFO, WARN, ERROR).

JUnit 5 + Mockito: testes unitários e isolamento de dependências externas.
