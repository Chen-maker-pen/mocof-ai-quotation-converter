FROM node:22-slim
WORKDIR /app
COPY package.json ./
# esbuild is a development dependency. Install it for the image build, bundle
# the worker, then remove development packages from the final runtime image.
RUN npm install
COPY server ./server
COPY src ./src
COPY worker ./worker
COPY server.ts ./
RUN npx esbuild worker/index.ts --bundle --platform=node --format=esm --packages=external --outfile=worker/server.mjs
RUN npm prune --omit=dev
ENV NODE_ENV=production
CMD ["node", "worker/server.mjs"]
