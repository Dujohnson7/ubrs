# ---- Stage 1: Build ----
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml for dependency caching
COPY pom.xml ./

# Pre-fetch dependencies
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src/ src/

# Build JAR package (skip unit tests for production build)
RUN mvn clean package -DskipTests -B

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:17-jre

WORKDIR /app

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads/signature /app/uploads/profile && \
    chmod -R 755 /app/uploads

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 7700

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]