FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=320
COPY deploy/awesome/runtime.tar.gz /tmp/runtime.tar.gz
RUN tar -xzf /tmp/runtime.tar.gz -C /app && rm /tmp/runtime.tar.gz
COPY public /app/public
COPY public /app/dist/client
USER 65532:65532
EXPOSE 8080
CMD ["node", "server.js"]
