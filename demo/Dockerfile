FROM maven:3.9-eclipse-temurin-21 as build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# Install curl and netcat for wait-for-it functionality
RUN apt-get update && apt-get install -y curl netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy the built jar file
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar ./app.jar

# Create a wait-for-it script
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
host="$1"\n\
port="$2"\n\
shift 2\n\
cmd="$@"\n\
\n\
until nc -z "$host" "$port"; do\n\
  >&2 echo "Waiting for $host:$port to be available..."\n\
  sleep 1\n\
done\n\
\n\
>&2 echo "$host:$port is available - executing command"\n\
exec $cmd' > /wait-for-it.sh && chmod +x /wait-for-it.sh

EXPOSE 8090
ENTRYPOINT ["/wait-for-it.sh", "database", "5432", "java", "-Dspring.profiles.active=docker", "-jar", "app.jar"]
