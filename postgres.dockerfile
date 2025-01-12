FROM postgres:15.1-alpine

LABEL author="Denis Khaskin"
LABEL description="Postgres Image for demo"
LABEL version="1.0"

COPY data/01-init-db.sql /docker-entrypoint-initdb.d/
COPY data/02-load-data.sql /docker-entrypoint-initdb.d/