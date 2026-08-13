# Midas API

> API REST do **Midas**, uma plataforma de leilões e comércio de produtos colecionáveis.

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-Build-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)

---

## 📌 Sobre o projeto

O **Midas API** é o backend da plataforma Midas, desenvolvido com **Java 21 e Spring Boot**.

A API centraliza as regras de negócio e fornece os recursos necessários para que clientes web e mobile possam interagir com a plataforma, incluindo:

- autenticação e autorização com JWT;
- gerenciamento de usuários e telefones;
- cadastro e gerenciamento de produtos;
- armazenamento de imagens via Cloudinary;
- criação e gerenciamento de leilões;
- registro de lances;
- favoritos;
- catálogo de categorias, raridades e estados físicos;
- loja de produtos;
- carrinho de compras;
- pedidos;
- pagamentos;
- avaliações da plataforma.

A aplicação utiliza **PostgreSQL** como banco de dados e **JPA/Hibernate** para persistência.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas, separando responsabilidades entre controllers, services, repositories, entidades e DTOs.

```text
┌──────────────────────────┐
│        Frontend          │
│   Web / Mobile / etc.    │
└────────────┬─────────────┘
             │ HTTP / JSON
             ▼
┌──────────────────────────┐
│       Controllers        │
│        REST API          │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│         Services         │
│      Regras de negócio   │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│       Repositories       │
│       Spring Data JPA    │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│        PostgreSQL        │
└──────────────────────────┘

             ┌─────────────────────┐
             │      Cloudinary      │
             │  Imagens de usuários │
             │      e produtos      │
             └─────────────────────┘
```

### Fluxo de uma requisição

```text
Request
   ↓
Security / JWT
   ↓
Controller
   ↓
DTO + Validation
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
   ↓
Mapper
   ↓
Response DTO
   ↓
JSON Response
```

---

## 🛠️ Tecnologias

| Tecnologia | Utilização |
|---|---|
| **Java 21** | Linguagem principal |
| **Spring Boot 4.1.0** | Framework principal |
| **Spring Web MVC** | Construção da API REST |
| **Spring Data JPA** | Persistência |
| **Hibernate** | ORM |
| **Spring Security** | Segurança e autenticação |
| **JJWT 0.13.0** | Geração e validação dos tokens JWT |
| **PostgreSQL** | Banco de dados |
| **MapStruct 1.6.3** | Mapeamento entre entidades e DTOs |
| **Lombok** | Redução de código boilerplate |
| **Cloudinary 2.0.0** | Armazenamento de imagens |
| **Bean Validation** | Validação dos dados de entrada |
| **Maven** | Gerenciamento e build do projeto |
| **Docker** | Containerização |

---

## 📂 Estrutura do projeto

```text
midas_api/
├── .mvn/
│   └── wrapper/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/midas_api/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── exception/
│   │   │       ├── mapper/
│   │   │       ├── repository/
│   │   │       ├── security/
│   │   │       └── service/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── LICENSE
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

### Responsabilidade das principais camadas

| Camada | Responsabilidade |
|---|---|
| `controller` | Receber requisições HTTP e retornar respostas |
| `service` | Implementar regras de negócio |
| `repository` | Comunicação com o banco |
| `entity` | Representação das tabelas do banco |
| `dto` | Contratos de entrada e saída da API |
| `mapper` | Conversão entre Entity e DTO |
| `security` | JWT, autenticação e componentes de segurança |
| `config` | Configurações da aplicação |
| `exception` | Exceções e tratamento global de erros |

---

# 🔐 Autenticação

A API utiliza autenticação **stateless** baseada em **JWT Bearer Token**.

Após o login ou cadastro, o cliente recebe um token:

```http
Authorization: Bearer <TOKEN>
```

Exemplo:

```http
GET /api/v1/carrinho
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

O JWT utiliza:

```text
sub = e-mail do usuário
uid = ID do usuário
iat = data de emissão
exp = data de expiração
```

A duração padrão do token é de **8 horas**, configurável através de `JWT_EXPIRATION_MS`.

As senhas são armazenadas utilizando **BCrypt**.

---

# 🚀 Principais recursos

## 👤 Usuários

- cadastro;
- login;
- consulta do próprio perfil;
- alteração de nome e username;
- alteração de e-mail;
- alteração de senha;
- exclusão da conta;
- gerenciamento de telefone;
- upload de foto de perfil.

## 📦 Produtos

- criação;
- consulta;
- atualização;
- exclusão;
- associação com categoria;
- associação com raridade;
- associação com estado físico;
- múltiplas imagens;
- armazenamento das imagens no Cloudinary.

## 🔨 Leilões

- criação de leilões;
- consulta;
- filtros por status;
- edição;
- ativação;
- finalização;
- cancelamento;
- exclusão;
- compra imediata;
- leilão tradicional;
- modalidade híbrida.

### Tipos de compra

```text
LEILAO
COMPRA_IMEDIATA
AMBOS
```

### Estados

```text
AGUARDANDO
ATIVO
FINALIZADO
CANCELADO
```

## 💰 Lances

- criação de lance;
- validação do valor;
- consulta de lances de um leilão;
- consulta dos lances realizados pelo usuário.

## ❤️ Favoritos

- adicionar leilão aos favoritos;
- listar favoritos;
- remover favorito.

## 🛒 Loja e carrinho

- catálogo da loja;
- consulta de produtos;
- criação e edição de produtos da loja;
- adicionar produtos ao carrinho;
- alterar quantidade;
- remover itens;
- limpar carrinho;
- checkout.

## 📋 Pedidos

- criação através do checkout;
- consulta dos pedidos do usuário;
- consulta individual;
- controle de status.

## 💳 Pagamentos

- PIX;
- cartão de crédito;
- cartão de débito;
- boleto;
- criação de pagamento;
- consulta;
- simulação de aprovação.

## ⭐ Avaliações

- criação de avaliação da plataforma;
- consulta das avaliações;
- notas de 1 a 5.

---

# 📚 Documentação da API

A documentação detalhada de todos os endpoints, DTOs, requests, responses, regras de negócio e fluxos está disponível em:

**[📖 Documentação completa da API](./MIDAS_API_DOCUMENTACAO.md)**

> O arquivo de documentação deve ser mantido junto ao repositório e atualizado sempre que endpoints ou regras de negócio forem alterados.

---

# ⚙️ Configuração

## Pré-requisitos

Antes de executar o projeto, instale:

- **Java 21**
- **PostgreSQL**
- **Git**
- opcionalmente **Docker**

O projeto possui Maven Wrapper, então não é necessário instalar o Maven globalmente.

---

## 🔑 Variáveis de ambiente

A aplicação carrega as configurações através de variáveis de ambiente e também suporta um arquivo `.env` local.

Exemplo:

```env
DB_URL=jdbc:postgresql://localhost:5432/midas
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_DRIVER=org.postgresql.Driver

JWT_SECRET=seu_segredo_jwt
JWT_EXPIRATION_MS=28800000

JPA_DDL_AUTO=validate

MAX_FILE_SIZE=5MB
MAX_REQUEST_SIZE=25MB

PORT=8080
```

### Variáveis disponíveis

| Variável | Obrigatória | Padrão |
|---|:---:|---|
| `DB_URL` | ✅ | - |
| `DB_USER` | ✅ | - |
| `DB_PASSWORD` | ✅ | - |
| `DB_DRIVER` | ❌ | `org.postgresql.Driver` |
| `JWT_SECRET` | ✅ | - |
| `JWT_EXPIRATION_MS` | ❌ | `28800000` |
| `JPA_DDL_AUTO` | ❌ | `validate` |
| `MAX_FILE_SIZE` | ❌ | `5MB` |
| `MAX_REQUEST_SIZE` | ❌ | `25MB` |
| `PORT` | ❌ | `8080` |

> ⚠️ **Nunca versione credenciais reais, senhas, chaves JWT ou outras informações sensíveis.**

---

# 🗄️ Banco de dados

A API utiliza PostgreSQL.

A aplicação está configurada por padrão com:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Portanto, o Hibernate **valida o schema existente** em vez de criar ou alterar automaticamente as tabelas.

A conexão é obtida através de:

```text
DB_URL
DB_USER
DB_PASSWORD
```

---

# ▶️ Executando localmente

## 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd midas_api
```

## 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DB_URL=jdbc:postgresql://localhost:5432/midas
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=seu_segredo_jwt
```

Adicione também as demais variáveis necessárias para seu ambiente.

## 3. Execute a aplicação

### Windows

```bash
mvnw.cmd spring-boot:run
```

### Linux/macOS

```bash
./mvnw spring-boot:run
```

A API estará disponível em:

```text
http://localhost:8080
```

---

# 📦 Build

Para gerar o `.jar`:

### Windows

```bash
mvnw.cmd clean package
```

### Linux/macOS

```bash
./mvnw clean package
```

O artefato será gerado em:

```text
target/midas_api-0.0.1-SNAPSHOT.jar
```

Executar diretamente:

```bash
java -jar target/midas_api-0.0.1-SNAPSHOT.jar
```

---

# 🐳 Docker

O projeto possui um `Dockerfile` multi-stage.

### Build da imagem

```bash
docker build -t midas_api .
```

### Executar

```bash
docker run -p 8080:8080 --env-file .env midas_api
```

A API ficará disponível em:

```text
http://localhost:8080
```

### Arquitetura do Dockerfile

```text
Stage 1
Maven + Java 21
       ↓
Compilação
       ↓
JAR

Stage 2
Java 21 JRE Alpine
       ↓
Copia o JAR
       ↓
Executa a aplicação
```

A porta pode ser definida através da variável:

```env
PORT=8080
```

Isso permite executar a mesma imagem em ambientes como Render, onde a plataforma fornece a porta através da variável `PORT`.

---

# ☁️ Deploy

A aplicação está preparada para execução em ambientes cloud através de Docker.

No ambiente de produção, configure pelo menos:

```env
DB_URL=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=...
```

E, quando necessário:

```env
JWT_EXPIRATION_MS=28800000
JPA_DDL_AUTO=validate
MAX_FILE_SIZE=5MB
MAX_REQUEST_SIZE=25MB
```

A porta deve ser obtida através da variável `PORT`.

### Banco externo

A API não exige que o banco PostgreSQL esteja hospedado junto da aplicação.

É possível utilizar um PostgreSQL gerenciado externamente, desde que `DB_URL`, `DB_USER` e `DB_PASSWORD` estejam configurados corretamente.

---

# ☁️ Cloudinary

As imagens da plataforma não são armazenadas diretamente no PostgreSQL.

O fluxo é:

```text
Cliente
   │
   │ multipart/form-data
   ▼
Midas API
   │
   │ Upload
   ▼
Cloudinary
   │
   │ URL da imagem
   ▼
Midas API
   │
   ▼
PostgreSQL
```

O banco armazena a referência/URL da imagem, enquanto o arquivo fica no Cloudinary.

Os principais usos são:

- foto de perfil;
- imagens de produtos.

### Limites

```text
Máximo por arquivo: 5 MB
Máximo por requisição: 25 MB
```

---

# 🌐 CORS

Durante o desenvolvimento, a aplicação permite requisições de origens locais.

Exemplos:

```text
http://localhost:*
http://127.0.0.1:*
```

Métodos suportados:

```text
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Para produção, recomenda-se restringir o CORS ao domínio oficial do frontend.

---

# 🔄 Fluxo principal da plataforma

## Cadastro e autenticação

```text
Cadastro
   ↓
POST /api/auth/register
   ↓
Usuário criado
   ↓
JWT
   ↓
Cliente autenticado
```

## Criação de leilão

```text
Usuário
   ↓
Cria produto
   ↓
Adiciona imagens
   ↓
Cria leilão
   ↓
Produto → EM_LEILAO
   ↓
Leilão → AGUARDANDO
```

## Lances

```text
Leilão → ATIVO
       ↓
Usuário realiza lance
       ↓
Validação
       ↓
Lance registrado
       ↓
Maior lance atualizado
```

## Compra imediata

```text
Leilão → ATIVO
       ↓
Compra imediata
       ↓
Pagamento
       ↓
Aprovação
       ↓
Produto → VENDIDO
       ↓
Leilão → FINALIZADO
```

## Loja

```text
Produto da loja
       ↓
Carrinho
       ↓
Checkout
       ↓
Pedido
       ↓
Pagamento
       ↓
Pedido → PAGO
```

---

# 🧪 Testes

O projeto possui estrutura para testes através do ecossistema de testes do Spring Boot.

Executar:

### Windows

```bash
mvnw.cmd test
```

### Linux/macOS

```bash
./mvnw test
```

---

# 📡 Principais endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Usuário autenticado |
| `GET` | `/api/v1/usuarios/{id}` | Perfil |
| `POST` | `/api/v1/produtos` | Criar produto |
| `GET` | `/api/v1/produtos` | Listar produtos |
| `GET` | `/api/v1/produtos/{id}` | Buscar produto |
| `POST` | `/api/v1/leiloes` | Criar leilão |
| `GET` | `/api/v1/leiloes` | Listar leilões |
| `GET` | `/api/v1/leiloes/{id}` | Buscar leilão |
| `POST` | `/api/v1/leiloes/{id}/lances` | Realizar lance |
| `GET` | `/api/v1/leiloes/{id}/lances` | Listar lances |
| `GET` | `/api/v1/favoritos` | Listar favoritos |
| `POST` | `/api/v1/favoritos` | Favoritar |
| `GET` | `/api/v1/produtos-loja` | Catálogo da loja |
| `GET` | `/api/v1/carrinho` | Consultar carrinho |
| `POST` | `/api/v1/carrinho/itens` | Adicionar ao carrinho |
| `POST` | `/api/v1/carrinho/checkout` | Realizar checkout |
| `GET` | `/api/v1/pedidos` | Listar pedidos |
| `POST` | `/api/v1/pagamentos` | Iniciar pagamento |
| `GET` | `/api/v1/avaliacoes` | Listar avaliações |
| `POST` | `/api/v1/avaliacoes` | Criar avaliação |

Para a relação completa, consulte **[MIDAS_API_DOCUMENTACAO.md](./MIDAS_API_DOCUMENTACAO.md)**.

---

# 🚨 Tratamento de erros

A API possui tratamento global de exceções.

Os principais códigos HTTP são:

| Código | Significado |
|---:|---|
| `200` | Sucesso |
| `201` | Recurso criado |
| `204` | Sucesso sem conteúdo |
| `400` | Requisição inválida |
| `401` | Não autenticado |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `409` | Conflito |
| `422` | Regra de negócio violada |
| `500` | Erro interno |

Exemplo:

```json
{
  "timestamp": "2026-08-13T14:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação nos campos enviados",
  "path": "/api/auth/register",
  "erros": [
    {
      "campo": "email",
      "mensagem": "deve ser um endereço de e-mail bem formado"
    }
  ]
}
```

---

# 🔒 Segurança

Algumas práticas adotadas no projeto:

- autenticação baseada em JWT;
- senhas protegidas com BCrypt;
- endpoints protegidos pelo Spring Security;
- validação de ownership em operações sensíveis;
- credenciais obtidas através de variáveis de ambiente;
- limite de tamanho para uploads;
- separação entre entidades e DTOs;
- configuração stateless da autenticação.

### ⚠️ Importante

Não coloque no Git:

```text
DB_PASSWORD
JWT_SECRET
Cloudinary credentials
tokens
API keys
.env
```

O `.env` já está incluído no `.gitignore`.

---

# 🧩 Controllers

Atualmente o projeto possui controllers para:

```text
AuthController
AvaliacaoController
CarrinhoController
CategoriaController
EstadoFisicoController
FavoritoController
IdentidadeVisualController
LanceController
LanceUsuarioController
LeilaoController
PagamentoController
PedidoController
ProdutoController
ProdutoLojaController
RaridadeController
TelefoneController
UsuarioController
WebController
```

---

# 🗺️ Roadmap

Algumas evoluções naturais para a API:

- [ ] Documentação OpenAPI/Swagger;
- [ ] refresh token;
- [ ] integração real com gateway de pagamentos;
- [ ] webhook autenticado de pagamentos;
- [ ] controle de acesso por roles;
- [ ] paginação dos endpoints de listagem;
- [ ] filtros avançados de leilões;
- [ ] ordenação de resultados;
- [ ] controle de concorrência para lances;
- [ ] testes unitários e de integração mais abrangentes;
- [ ] observabilidade e métricas;
- [ ] rate limiting;
- [ ] pipeline CI/CD.

---

# 🤝 Contribuição

1. Faça um fork do projeto.
2. Crie uma branch:

```bash
git checkout -b feature/minha-feature
```

3. Faça suas alterações.
4. Execute os testes:

```bash
./mvnw test
```

5. Faça o commit:

```bash
git commit -m "feat: adiciona minha feature"
```

6. Envie a branch:

```bash
git push origin feature/minha-feature
```

7. Abra um Pull Request.

---

# 📜 Licença

Este projeto está distribuído sob a licença definida no arquivo [`LICENSE`](./LICENSE).

---

# 👨‍💻 Projeto

**Midas API**

Backend da plataforma Midas, responsável por autenticação, usuários, produtos, leilões, lances, favoritos, loja, carrinho, pedidos e pagamentos.

```text
Java 21 + Spring Boot + PostgreSQL + JWT + Cloudinary
```

---

<p align="center">
  Desenvolvido com Java ☕ e Spring Boot 🍃
</p>
