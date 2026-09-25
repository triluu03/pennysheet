BACKEND_DIR := pennysheet-backend
FRONTEND_DIR := pennysheet-frontend
BUILD_DIR := builds

BACKEND_BIN := pennysheet-backend
FRONTEND_DIST := $(FRONTEND_DIR)/dist
MCP_BIN := pennysheet-mcp

PROJECT_DIR := $(shell pwd)
PLIST := $(PROJECT_DIR)/com.triluu.pennysheet.plist

.PHONY: all build-backend build-frontend build-mcp clean test generate launch stop relaunch

all: build-backend build-frontend build-mcp

test:
	cd $(BACKEND_DIR) && cargo test

build-backend:
	cd $(BACKEND_DIR) && cargo build --release
	mkdir -p $(BUILD_DIR)
	cp $(BACKEND_DIR)/target/release/$(BACKEND_BIN) $(BUILD_DIR)/

build-frontend:
	cd $(FRONTEND_DIR) && npm run build
	mkdir -p $(BUILD_DIR)/dist
	cp -r $(FRONTEND_DIST)/. $(BUILD_DIR)/dist/

build-mcp:
	cd $(BACKEND_DIR) && cargo build --release -p pennysheet-mcp
	mkdir -p $(BUILD_DIR)
	cp $(BACKEND_DIR)/target/release/$(MCP_BIN) $(BUILD_DIR)/

clean:
	rm -rf $(BUILD_DIR)
	cd $(BACKEND_DIR) && cargo clean
	rm -rf $(FRONTEND_DIST)

generate:
	sed 's|__PROJECT_DIR__|$(PROJECT_DIR)|g' com.triluu.pennysheet.plist.template > $(PLIST)

launch: generate
	launchctl load $(PLIST)

stop:
	launchctl unload $(PLIST)

relaunch: stop all launch
