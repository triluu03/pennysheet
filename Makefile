BACKEND_DIR := pennysheet-backend
FRONTEND_DIR := pennysheet-frontend
BUILD_DIR := builds

BACKEND_BIN := pennysheet-backend
FRONTEND_DIST := $(FRONTEND_DIR)/dist

.PHONY: all build-backend build-frontend clean test

all: build-backend build-frontend

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

clean:
	rm -rf $(BUILD_DIR)
	cd $(BACKEND_DIR) && cargo clean
	rm -rf $(FRONTEND_DIST)
