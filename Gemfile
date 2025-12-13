source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.4.1"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 8.0.2"

# JSON-backed, nestable models
gem "store_model", "~> 1.6"

# Use PostgreSQL as the database for Active Record
gem "pg", "~> 1.5"

# Perform full text search with Postgres
gem "pg_search", "~> 2.3"

# Use RGeo geometry types
gem "rgeo", "~> 3.0"
gem "rgeo-geojson", "~> 2.2"
gem "rgeo-activerecord", "~> 8.0"

# Enable additional operators and utilities for Active Record with PostgreSQL
gem "active_record_extended", github: "GeorgeKaraszi/ActiveRecordExtended", branch: "feature/rails80"

# Use PostGIS extensions for PostgreSQL
gem "activerecord-postgis-adapter", github: "rgeo/activerecord-postgis-adapter", ref: "32d58f3d3df94779acabba3a2e510de56a2bce63"

# Use enhanced PostgreSQL adapter for Action Cable
gem "actioncable-enhanced-postgresql-adapter", "~> 1.0"

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", "~> 6.6.0"

# Use Redis adapter to run Action Cable in production
# gem "redis", "~> 4.0"

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[windows jruby]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Add HTTP asset caching/compression and X-Sendfile acceleration to Puma [https://github.com/basecamp/thruster/]
gem "thruster", require: false

# Use Active Storage variants [https://guides.rubyonrails.org/active_storage_overview.html#transforming-images]
gem "image_processing", "~> 1.12"
gem "ruby-vips", "~> 2.2", require: false

# Use S3 as the backend for Active Storage
gem "aws-sdk-s3", "~> 1.126", require: false

# Use Good Job as the backend for Active Job
gem "good_job", "~> 4.7.0"

# Send emails with Mailjet
gem "mailjet", "~> 1.7"

# Use FriendlyId to create human-friendly identifiers for models
gem "friendly_id", "~> 5.5"

# Modern concurrency tools
gem "concurrent-ruby", "~> 1.1"

# Use Faraday to make HTTP requests
gem "faraday", "~> 2.10"

# Show a healthcheck route
gem "rails-healthcheck"

# Silence logs from certain actions
gem "silencer", "~> 2.0", require: false

# Validate emails, phone numbers, dates, arrays, and more
gem "can_has_validations", "~> 1.8"
gem "email_validator", "~> 2.2"
gem "phonelib", "~> 0.10.10"
gem "validate_url", "~> 1.0"
gem "date_validator", "~> 0.12.0"
gem "active_storage_validations", "~> 0.9.6"

# Introspect program at runtime with Pry
gem "pry"
gem "pry-rails"
gem "pry-rescue"
gem "pry-sorbet", require: false
gem "pry-stack_explorer", require: false
gem "break", require: false

# Load environment variables from .env
gem "dotenv", "~> 2.7", require: false

# Parse and manipulate URIs
gem "addressable", "~> 2.8"

# Handle soft deletions with Discard
gem "discard", "~> 1.2"

# Typecheck code at runtime
gem "sorbet-runtime"

# Use Enumerize to enumerate attributes
gem "enumerize", "~> 2.6"

# Use Action Policy to authorize actions
gem "action_policy", "~> 0.6.5"

# Serve and bundle frontend with Vite
gem "vite_rails", "~> 3.0"

# Use Inertia framework for server-driven SPAs
gem "inertia_rails", "~> 3.10.0"

# Use Premailer to inline CSS into email templates
gem "premailer-rails", "~> 1.12"

# Use Sentry for error reporting
gem "sentry-rails", "~> 5.9"
gem "stackprof"

# Run post-deploy tasks with after_party
gem "after_party", "~> 1.11"

# Handle CORS requests
gem "rack-cors", "~> 2.0"

# Cache counts in models with CounterCulture
gem "counter_culture", "~> 3.5"

# Serialize JSON with MultiJSON
gem "multi_json", "~> 1.15"

# Access YAML records
gem "frozen_record", "~> 0.27.1"

# Fast JSON serialization
gem "oj_serializers", "~> 2.0"

# Generate Typescript from serializers
gem "types_from_serializers", "~> 2.1"

# Paginate records with Pagy
gem "pagy", "~> 9.2"

# Send web push notifications
gem "web-push", "~> 3.0"

# Up-to-date Emoji Regex
gem "unicode-emoji", "~> 3.7", require: "unicode/emoji"

# Verify JWTs
gem "jwt", "~> 2.9"

# Parse HTML with Nokogiri
gem "nokogiri", "~> 1.15"

# Convert HTML to plain text
gem "html2text", "~> 0.4.0"

# Generate fake data
gem "faker", "~> 3.5"

# Count words
gem "words_counted", "~> 1.0"

# Send SMS with Twilio
gem "twilio-ruby", "~> 7.5"

# Manage money with Money Rails
gem "money-rails", "~> 1.15"

# Fetch Spotify metadata
gem "rspotify", "~> 2.12"

# Use Turbo drive and Hotwire
gem "turbo-rails", "~> 2.0"

# Use lexxy to edit rich text
gem "lexxy", "~> 0.1.23.beta"

# Use Heroicon icons
gem "heroicons", "~> 2.2"

group :development, :test do
  # Debug code with debug
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"

  # Static analysis for security vulnerabilities [https://brakemanscanner.org/]
  gem "brakeman", require: false

  # Auto-detect and warn about N+1 queries
  gem "prosopite"
  gem "pg_query"

  # Generate Typescript path helpers
  gem "js_from_routes", "~> 4.0"

  # Use Rubocop to lint code
  gem "rubocop", "~> 1.74", require: false
  gem "rexml", ">= 3.3.6", require: false
  gem "rubocop-performance", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-sorbet", require: false
  gem "rubocop-rails-omakase", require: false
  gem "rubocop-capybara", require: false
  gem "ruby-lsp", require: false
  # gem "rbs", require: false
end

group :development do
  # Run git hooks with Lefthook
  gem "lefthook", "~> 1.7", require: false

  # Patch-level verification for Bundler
  gem "bundler-audit", "~> 0.9.2", require: false

  # Detect file changes for live reload
  gem "listen", "~> 3.8"

  # Wipe out inconsistent DB and schema.rb when switching branches
  gem "actual_db_schema", "~> 0.7.9"

  # Rerun programs when files change
  gem "rerun", "~> 0.14.0", require: false

  # Typecheck code
  gem "sorbet", require: false
  gem "spoom", require: false
  gem "tapioca", "~> 0.17.7", require: false

  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  # Display better error pages during development
  gem "better_errors"

  # Annotate models and routes
  gem "annotaterb", require: false

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  gem "rack-mini-profiler"
  gem "memory_profiler"
end

group :test do
  # Use system testing [https://guides.rubyonrails.org/testing.html#system-testing]
  gem "capybara"
  gem "capybara-playwright-driver"
  gem "rack-test"
end
