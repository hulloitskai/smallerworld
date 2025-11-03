# syntax = docker/dockerfile:1.2
# check=error=true

# Build this image with:
#   docker build -t smallerworld:latest .
#   docker build -t smallerworld:debug --build-arg DEBUG=1 .

# == System
# NOTE: We separate system dependencies from application dependencies (see
# base layer) to speed up builds when only application dependencies change.
FROM debian:bookworm-slim AS system
ARG DEBUG=""

# Configure workdir and shell
WORKDIR /app
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Ensure packages are cached
RUN rm /etc/apt/apt.conf.d/docker-clean

# Install system dependencies
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  apt-get update -yq && \
  echo "ca-certificates vim less tmux" | xargs apt-get install -yq --no-install-recommends && \
  apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false llvm && \
  rm -r /var/log/* /var/lib/apt/lists/*
ENV EDITOR=vi

# Install devtools with mise
ENV MISE_DATA_DIR="/mise"
ENV MISE_CONFIG_DIR="/mise"
ENV MISE_CACHE_DIR="/mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV MISE_VERBOSE="${DEBUG:+1}"
ENV PATH="/mise/shims:$PATH"
COPY mise.toml ./
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="build-essential curl zlib1g-dev libffi-dev libyaml-dev libjemalloc-dev" \
  RUNTIMES_DEPS="libyaml-0-2 libjemalloc2"; \
  set -eux && \
  apt-get update -yq && \
  echo $BUILD_DEPS $RUNTIMES_DEPS | xargs apt-get install -yq --no-install-recommends; \
  curl https://mise.run | sh && \
  mise trust && \
  mise install && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r /var/log/* /var/lib/apt/lists/*

# == Base (without built assets)
FROM system AS base

# Install Ruby dependencies
COPY Gemfile Gemfile.lock ./
ENV BUNDLE_DEPLOYMENT=1 GEM_HOME=/usr/local/bundle BUNDLE_PATH=/usr/local/bundle BUNDLE_WITHOUT="development test"
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="build-essential libreadline-dev libyaml-dev libjemalloc-dev libpq-dev git" \
  RUNTIME_DEPS="libpq5 libvips"; \
  set -eux && \
  apt-get update -yq && \
  echo $BUILD_DEPS $RUNTIME_DEPS | xargs apt-get install -yq --no-install-recommends; \
  BUNDLE_IGNORE_MESSAGES=1 bundle install && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r /var/log/* /var/lib/apt/lists/* && \
  rm -r /root/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
  find "${BUNDLE_PATH}"/ruby/*/bundler/gems/ -name "*.c" -delete && \
  find "${BUNDLE_PATH}"/ruby/*/bundler/gems/ -name "*.o" -delete && \
  bundle exec bootsnap precompile --gemfile

# Install NodeJS dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
  npm ci


# == Builder
FROM base AS builder

# Copy application code
COPY . ./

# Build assets
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
  SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bin/rails assets:precompile


# == Application
FROM base AS app
ENV RAILS_PORT=3000

# Copy application code
COPY . ./

# Copy built assets
COPY --from=builder /app/dist/ssr ./dist/ssr
COPY --from=builder /app/public/dist ./public/dist

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# Configure application environment
ENV RAILS_ENV=production RAILS_LOG_TO_STDOUT=true MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true"

# Expose ports
EXPOSE ${RAILS_PORT}

# Configure healthcheck
HEALTHCHECK --interval=15s --timeout=2s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:${RAILS_PORT}/up

# Set entrypoint and default command
CMD [ "bin/run" ]
