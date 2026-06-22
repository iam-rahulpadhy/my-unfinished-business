# ─── Stage 1: Build ─────────────────────────────────────────────────────────
FROM maven:3.9.7-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies first (layer cache optimization)
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S mub && adduser -S mub -G mub
COPY --from=builder /app/target/*.jar app.jar
USER mub
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
