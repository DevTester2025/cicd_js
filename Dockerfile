# Stage 1: Build the Angular application
FROM node:16 AS build
ARG ENV
 
# Set the working directory
WORKDIR /usr/src/app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm install --legacy-peer-deps
 
# Copy the rest of the application code
COPY . .
 
# Build the application
RUN if [ "$ENV" = "dev" ]; then npm run build-dev ; fi
RUN if [ "$ENV" = "test" ]; then npm run build-test; fi
RUN if [ "$ENV" = "prod" ]; then npm run build-prod; fi
RUN if [ "$ENV" = "demo" ]; then npm run build-demo; fi

# Stage 2: Serve the Built Angular Application
FROM node:16
WORKDIR /app
COPY --from=build ./dist/cloudmatiq-web /app
RUN npm i -g serve@13.0.0
CMD ["serve", "-s", "-l", "4200"]
EXPOSE 4200
