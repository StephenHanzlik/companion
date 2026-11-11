# Runs entirely self-contained: no local Go/sqlc install required. sqlc
# codegen happens in the first stage; `go mod tidy` resolves/locks
# dependencies in the second, since no go.sum is committed (it can't be
# generated without a local Go toolchain).

FROM golang:1.26-alpine AS sqlc-gen
RUN apk add --no-cache git
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1
WORKDIR /src
COPY sqlc.yaml ./
COPY db ./db
RUN sqlc generate

FROM golang:1.26-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY --from=sqlc-gen /src/internal/db ./internal/db
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

# Alpine rather than distroless: costs a few MB, but keeps a shell available
# for `wrangler containers exec`/ssh debugging in production -- distroless's
# total lack of one made a real incident much harder to diagnose than it
# needed to be.
FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /out/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
