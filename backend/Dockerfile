# syntax=docker/dockerfile:1
# Derleme: amd64 runner’da arm64 için GOARCH çapraz derleme (multi-platform imaj)
FROM --platform=$BUILDPLATFORM golang:1.22-alpine AS build
ARG TARGETARCH
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /server /server
EXPOSE 8080
ENV ADDR=:8080
USER nobody
ENTRYPOINT ["/server"]
