# Stage 1: Build
FROM node:18-bullseye AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps --prefer-offline

# Copy the rest of the source code
COPY . .

# Build-time environment variables
ARG MONGODB_URI
ARG AUTH_SECRET
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG RESEND_API_KEY
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET

# Set environment variables
ENV MONGODB_URI=$MONGODB_URI
ENV AUTH_SECRET=$AUTH_SECRET
ENV AUTH_GOOGLE_ID=$AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_SECRET=$AUTH_GOOGLE_SECRET
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Build Next.js app
RUN npm run build

# Stage 2: Production image
FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm ci --legacy-peer-deps --production

# Expose port
EXPOSE 3000

# Start the app
CMD ["npx", "next", "start", "-p", "3000"]