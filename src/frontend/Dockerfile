# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0
# This dockerfile is tweaked to just push the image. The build should be done locally so it can be copied over to the docker file

FROM node:20-alpine AS runner
RUN apk add --no-cache protobuf-dev protoc
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY . .
COPY  --chown=nextjs:nodejs ./.next/standalone ./
COPY  --chown=nextjs:nodejs ./.next/static ./.next/static

USER nextjs

ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT ["npm", "start"]

