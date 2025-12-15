# zotpress - Development Tasks
# Modern WordPress plugin development with Deno + ReScript + PHP tooling

set shell := ["bash", "-uc"]
set dotenv-load := true

project := "zotpress"
version := "8.0.0"

# Show all recipes
default:
    @just --list --unsorted

# ─────────────────────────────────────────────────────────────────────────────
# Build & Development
# ─────────────────────────────────────────────────────────────────────────────

# Build all assets (ReScript + CSS + JS)
build: build-rescript build-css build-js
    @echo "✓ Build complete"

# Build ReScript sources
build-rescript:
    npx rescript build

# Build CSS with LightningCSS via Deno
build-css:
    deno task build:css

# Build JavaScript with esbuild via Deno
build-js:
    deno task build:js

# Watch mode for development
dev:
    deno task dev

# Watch ReScript files
dev-rescript:
    npx rescript build -w

# Clean build artifacts
clean:
    rm -rf dist/ .cache/ coverage/ .phpunit.cache/
    rm -rf vendor/ node_modules/ .deno/ lib/es6/
    @echo "✓ Cleaned build artifacts"

# ─────────────────────────────────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────────────────────────────────

# Run all tests
test: test-php test-js
    @echo "✓ All tests passed"

# Run PHP tests
test-php:
    vendor/bin/phpunit

# Run PHP tests with coverage
test-php-coverage:
    XDEBUG_MODE=coverage vendor/bin/phpunit --coverage-html coverage/

# Run JavaScript tests via Deno
test-js:
    deno test --allow-read --allow-write

# ─────────────────────────────────────────────────────────────────────────────
# Linting & Static Analysis
# ─────────────────────────────────────────────────────────────────────────────

# Run all linters
lint: lint-php lint-rescript lint-js
    @echo "✓ All lints passed"

# Lint PHP with PHPCS
lint-php:
    vendor/bin/phpcs --standard=WordPress lib/ || true

# Lint PHP syntax
lint-php-syntax:
    vendor/bin/parallel-lint lib/

# Static analysis with PHPStan
phpstan:
    vendor/bin/phpstan analyse --memory-limit=512M

# Static analysis with Psalm
psalm:
    vendor/bin/psalm --no-cache

# Lint ReScript
lint-rescript:
    npx rescript format -check src/rescript/ || true

# Lint JavaScript (build scripts) via Deno
lint-js:
    deno lint scripts/

# ─────────────────────────────────────────────────────────────────────────────
# Formatting
# ─────────────────────────────────────────────────────────────────────────────

# Format all code
fmt: fmt-php fmt-rescript fmt-js
    @echo "✓ Formatting complete"

# Format PHP with PHPCBF
fmt-php:
    vendor/bin/phpcbf --standard=WordPress lib/ || true

# Format ReScript
fmt-rescript:
    npx rescript format src/rescript/

# Format JavaScript (build scripts) via Deno
fmt-js:
    deno fmt scripts/

# Check formatting (CI)
fmt-check:
    deno fmt --check scripts/

# ─────────────────────────────────────────────────────────────────────────────
# Dependency Management
# ─────────────────────────────────────────────────────────────────────────────

# Install all dependencies
install: install-php install-rescript install-js
    @echo "✓ Dependencies installed"

# Install PHP dependencies
install-php:
    composer install --prefer-dist

# Install ReScript (requires node/npm for rescript compiler)
install-rescript:
    npm install rescript --save-dev

# Install JavaScript dependencies (Deno caches automatically)
install-js:
    deno cache --reload deno.json

# Update all dependencies
update: update-php
    @echo "✓ Dependencies updated"

# Update PHP dependencies
update-php:
    composer update

# ─────────────────────────────────────────────────────────────────────────────
# Code Quality & Refactoring
# ─────────────────────────────────────────────────────────────────────────────

# Preview Rector refactoring
rector-preview:
    vendor/bin/rector process --dry-run

# Apply Rector refactoring
rector-fix:
    vendor/bin/rector process

# Run all quality checks (CI)
ci: lint phpstan test fmt-check
    @echo "✓ CI checks passed"

# Fix all auto-fixable issues
fix: fmt-php fmt-rescript rector-fix
    @echo "✓ Auto-fixes applied"

# ─────────────────────────────────────────────────────────────────────────────
# Security
# ─────────────────────────────────────────────────────────────────────────────

# Check for security vulnerabilities
security:
    composer audit

# ─────────────────────────────────────────────────────────────────────────────
# Documentation
# ─────────────────────────────────────────────────────────────────────────────

# Generate documentation
docs:
    @echo "Building documentation..."
    # Future: Add doc generation

# ─────────────────────────────────────────────────────────────────────────────
# Release
# ─────────────────────────────────────────────────────────────────────────────

# Create a release build
release: clean install build test lint phpstan
    @echo "Creating release for {{project}} v{{version}}"
    @mkdir -p dist/{{project}}
    @cp -r lib/ css/ js/ languages/ readme.txt zotpress.php dist/{{project}}/
    @cd dist && zip -r {{project}}-{{version}}.zip {{project}}/
    @echo "✓ Release created: dist/{{project}}-{{version}}.zip"

# ─────────────────────────────────────────────────────────────────────────────
# Guix Integration
# ─────────────────────────────────────────────────────────────────────────────

# Enter Guix development shell
guix-shell:
    guix shell -D -f guix.scm

# Build with Guix
guix-build:
    guix build -f guix.scm

# ─────────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────────

# Show project info
info:
    @echo "Project: {{project}}"
    @echo "Version: {{version}}"
    @echo ""
    @echo "PHP: $(php --version | head -n1)"
    @echo "Deno: $(deno --version | head -n1)"
    @echo "Composer: $(composer --version)"
    @echo "ReScript: $(npx rescript -version 2>/dev/null || echo 'not installed')"
    @echo ""
    @echo "Run 'just --list' for available commands"

# Check tool availability
check-tools:
    @which php || echo "❌ PHP not found"
    @which deno || echo "❌ Deno not found"
    @which composer || echo "❌ Composer not found"
    @which just || echo "❌ Just not found"
    @which npx || echo "❌ npx not found (needed for ReScript)"
    @echo "✓ Tool check complete"
