CACHE_DIR=.cache
INPUT_DIR=src
OUTPUT_DIR=lib
TSCONFIG_CREATOR=scripts/create-tsconfig.js

tsc := node_modules/.bin/tsc
src_files := $(wildcard $(INPUT_DIR)/*.ts)
transpiled_files := $(patsubst $(INPUT_DIR)/%.ts,$(OUTPUT_DIR)/%.jsx,$(src_files))

.PHONY: all
all: $(transpiled_files)

$(CACHE_DIR):
	mkdir -p $@

$(OUTPUT_DIR)/%.jsx: $(INPUT_DIR)/%.ts $(CACHE_DIR) $(TSCONFIG_CREATOR)
	node $(TSCONFIG_CREATOR) ../$< ../$@ > $(CACHE_DIR)/tsconfig.json
	tsc -p $(CACHE_DIR)

.PHONY: clean
clean:
	-rm -r $(OUTPUT_DIR) $(CACHE_DIR)
