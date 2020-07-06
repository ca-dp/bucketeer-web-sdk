NPM_BIN_DIR := $(CURDIR)/node_modules/.bin
SDK_DIR := $(CURDIR)/..

.PHONY: init
init: ## Install dependencies.
	yarn

.PHONY: start
start:
	node $(CURDIR)/__build/server/index.js

.PHONY: clean
clean:
	rm -rf $(CURDIR)/__build

.PHONY: build
build: clean
	$(MAKE) copy_genfiles -C $(SDK_DIR)
	$(MAKE) __build -C $(CURDIR)

.PHONY: __build
__build: build_client build_server

.PHONY: build_client
build_client:
	$(NPM_BIN_DIR)/tsc --project $(CURDIR)/src/client/tsconfig.json
	$(NPM_BIN_DIR)/webpack --hide-modules

.PHONY: build_server
build_server:
	$(NPM_BIN_DIR)/tsc --project $(CURDIR)/src/server/tsconfig.json
