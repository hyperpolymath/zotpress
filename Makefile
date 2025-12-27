# Zotpress - Dead Simple Build & Install
# SPDX-License-Identifier: AGPL-3.0-or-later

.PHONY: all install build dev clean package help demo

# Default: show help
all: help

# ============================================================================
# QUICK START (choose one)
# ============================================================================

## Install plugin to WordPress (symlink for development)
install:
	@echo "Installing Zotpress to WordPress..."
	@if [ -z "$(WP_PLUGINS)" ]; then \
		echo "Error: Set WP_PLUGINS to your WordPress plugins directory"; \
		echo "Example: make install WP_PLUGINS=/var/www/html/wp-content/plugins"; \
		exit 1; \
	fi
	@ln -sf "$(CURDIR)" "$(WP_PLUGINS)/zotpress"
	@echo "✓ Installed! Activate in WordPress admin"

## Build CSS/JS assets (requires Deno)
build:
	@echo "Building assets..."
	@command -v deno >/dev/null 2>&1 && deno task build || echo "Deno not found - using pre-built assets"
	@echo "✓ Build complete"

## Watch mode for development
dev:
	@deno task dev

## Create distributable zip
package:
	@echo "Creating zotpress.zip..."
	@rm -rf dist/zotpress dist/zotpress.zip
	@mkdir -p dist/zotpress
	@cp -r lib css js languages zotpress.php readme.txt dist/zotpress/ 2>/dev/null || true
	@cp -r dist/css dist/js dist/zotpress/ 2>/dev/null || true
	@cd dist && zip -r zotpress.zip zotpress
	@echo "✓ Created dist/zotpress.zip"

## Clean build artifacts
clean:
	@rm -rf dist .cache coverage
	@echo "✓ Cleaned"

# ============================================================================
# DEMO - Minimal Zotero→WordPress Example
# ============================================================================

## Run demo (show how to use Zotpress)
demo:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════════╗"
	@echo "║                    ZOTPRESS DEMO                                 ║"
	@echo "╚══════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "1. ADD YOUR ZOTERO ACCOUNT"
	@echo "   Go to: WordPress Admin → Zotpress → Accounts"
	@echo "   - User ID: Your Zotero user ID (from zotero.org/settings/keys)"
	@echo "   - API Key: Create at zotero.org/settings/keys"
	@echo ""
	@echo "2. DISPLAY A BIBLIOGRAPHY"
	@echo "   Add this shortcode to any post/page:"
	@echo ""
	@echo "   [zotpress userid=\"YOUR_USER_ID\" limit=\"10\"]"
	@echo ""
	@echo "3. FILTER BY COLLECTION"
	@echo "   [zotpress collection=\"ABC123\" style=\"chicago-note-bibliography\"]"
	@echo ""
	@echo "4. CITE SPECIFIC ITEMS"
	@echo "   [zotpress item=\"XYZ789\"]"
	@echo ""
	@echo "5. IN-TEXT CITATIONS"
	@echo "   According to [zotpressInText item=\"ABC123\"], the study shows..."
	@echo "   [zotpressInTextBib]  ← Put this at the end for bibliography"
	@echo ""
	@echo "For more options, see: https://github.com/hyperpolymath/zotpress"
	@echo ""

# ============================================================================
# HELP
# ============================================================================

help:
	@echo ""
	@echo "ZOTPRESS - Zotero integration for WordPress"
	@echo "============================================"
	@echo ""
	@echo "Quick Start:"
	@echo "  make install WP_PLUGINS=/path/to/wp-content/plugins"
	@echo "  make demo       # Show usage examples"
	@echo ""
	@echo "Development:"
	@echo "  make build      # Build CSS/JS"
	@echo "  make dev        # Watch mode"
	@echo "  make package    # Create distributable zip"
	@echo "  make clean      # Clean artifacts"
	@echo ""
