# syntax = docker/dockerfile:1.2
# check=error=true

# == System
# NOTE: We separate system dependencies from application dependencies (see
# base layer) to speed up builds when only application dependencies change.
FROM debian:bookworm-slim AS system
ENV OVERMIND_VERSION=2.5.1
ENV STARSHIP_VERSION=1.20.1
ENV DEVTOOLS="vim less"
ENV LIBRARIES="libvips"

# Configure workdir
WORKDIR /app

# Ensure packages are cached
RUN rm /etc/apt/apt.conf.d/docker-clean

# Install runtime programs and dependencies
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  apt-get update -yq && \
  echo "ca-certificates tmux $DEVTOOLS $LIBRARIES" | xargs apt-get install -yq --no-install-recommends && \
  apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false llvm && \
  rm -r /var/log/* && \
  tmux -V

# Install Ruby and Bundler
COPY .ruby-version ./
ENV LANG=C.UTF-8 GEM_HOME=/usr/local/bundle
ENV BUNDLE_SILENCE_ROOT_WARNING=1 BUNDLE_APP_CONFIG="$GEM_HOME" BUNDLE_PATH="/usr/local/bundle" BUNDLE_DEPLOYMENT="1" PATH="$GEM_HOME/bin:$PATH"
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="git curl build-essential zlib1g-dev libssl-dev libgmp-dev libyaml-dev libjemalloc-dev" set -eux && \
  RUNTIME_DEPS="libyaml-0-2 libjemalloc2" && \
  apt-get update -yq && \
  echo $BUILD_DEPS $RUNTIME_DEPS | xargs apt-get install -yq --no-install-recommends; \
  git clone --depth 1 https://github.com/rbenv/ruby-build.git && \
  PREFIX=/tmp ./ruby-build/install.sh && \
  mkdir -p "$GEM_HOME" && chmod 1777 "$GEM_HOME" && \
  RUBY_CONFIGURE_OPTS=--with-jemalloc /tmp/bin/ruby-build "$(cat .ruby-version)" /usr/local && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r ./ruby-build /tmp/* /var/log/* && \
  ruby --version && gem --version && bundle --version

# Install NodeJS
COPY .node-version ./
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="git curl" set -eux && \
  apt-get update -yq && \
  echo $BUILD_DEPS | xargs apt-get install -yq --no-install-recommends; \
  git clone --depth 1 https://github.com/nodenv/node-build.git && \
  PREFIX=/tmp ./node-build/install.sh && \
  /tmp/bin/node-build "$(cat .node-version)" /usr/local && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r ./node-build /var/log/* && \
  node --version && npm --version

# Install Overmind
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="curl" set -eux && \
  apt-get update -yq && \
  echo $BUILD_DEPS | xargs apt-get install -yq --no-install-recommends; \
  curl -Lo /usr/bin/overmind.gz https://github.com/DarthSim/overmind/releases/download/v$OVERMIND_VERSION/overmind-v$OVERMIND_VERSION-linux-amd64.gz && \
  gzip -d /usr/bin/overmind.gz && \
  chmod u+x /usr/bin/overmind && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r /var/log/* && \
  overmind --version

# Configure shell
ENV SHELL=/bin/bash
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="curl" set -eux && \
  apt-get update -yq && \
  echo $BUILD_DEPS | xargs apt-get install -yq --no-install-recommends; \
  curl -sS https://starship.rs/install.sh | sh -s -- -y -v="v$STARSHIP_VERSION" && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r /tmp/* /var/log/* && \
  starship --version
COPY .bash_profile .inputrc /root/
COPY starship.toml /root/.config/starship.toml


# == Base (without built assets)
FROM system AS base

# Install Ruby dependencies
COPY Gemfile Gemfile.lock ./
ENV BUNDLE_WITHOUT="development test"
RUN --mount=type=cache,target=/var/cache,sharing=locked \
  --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
  BUILD_DEPS="build-essential libreadline-dev libyaml-dev libjemalloc-dev libpq-dev git" \
  RUNTIME_DEPS="libpq5" set -eux && \
  apt-get update -yq && \
  echo $BUILD_DEPS $RUNTIME_DEPS | xargs apt-get install -yq --no-install-recommends; \
  BUNDLE_IGNORE_MESSAGES=1 bundle install && \
  echo $BUILD_DEPS | xargs apt-get purge -yq --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
  rm -r /var/log/* && \
  rm -r /root/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
  find "${BUNDLE_PATH}"/ruby/*/bundler/gems/ -name "*.c" -delete && \
  find "${BUNDLE_PATH}"/ruby/*/bundler/gems/ -name "*.o" -delete && \
  bundle exec bootsnap precompile --gemfile


# == Builder
FROM base AS builder

# Install NodeJS dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm install

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
