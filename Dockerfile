# Etapa 1: compila a aplicação com Maven + Java 21
FROM maven:3.9.16-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copia primeiro o pom.xml para aproveitar o cache das dependências
COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

# Copia o código e gera o JAR
COPY src ./src
RUN mvn -B -DskipTests clean package

# Etapa 2: imagem final menor, somente com o Java necessário para executar
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copia o JAR produzido na etapa de build
COPY --from=build /app/target/*.jar app.jar

# Porta usada localmente. No Render, a variável PORT é definida pela plataforma.
EXPOSE 8080

# Usa a PORT do Render quando existir; localmente usa 8080.
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
