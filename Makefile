.PHONY: all build test test-redteam scan docker-up docker-down clean lint

CARGO ?= cargo

all: build test

build:
	$(CARGO) build --release --workspace

test:
	$(CARGO) test --workspace

test-redteam:
	$(CARGO) test -p redteam_simulations

scan:
	$(CARGO) run --bin stateguard-cli -- scan ./tests/sample_traces --sarif output.sarif

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down -v

lint:
	$(CARGO) clippy --workspace -- -D warnings
	$(CARGO) fmt --all -- --check

clean:
	$(CARGO) clean
	rm -f output.sarif
