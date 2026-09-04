# ---- Stage 1: Build ----
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first for dependency caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:resolve -B

# Copy source code
COPY src/ src/

# Build the application (skip tests for faster builds)
RUN ./mvnw package -DskipTests -B

# ---- Stage 2: Runtime ----
FROM eclipse-temurin:17-jre

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render sets PORT env var)
EXPOSE 7700

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
