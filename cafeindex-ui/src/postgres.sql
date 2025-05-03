-- Create database (if it doesn't exist)
-- Connect to PostgreSQL first
CREATE DATABASE cafeindex;

-- Connect to the cafeindex database
\c cafeindex

-- Create the Price table based on the GraphQL schema
CREATE TABLE "Price" (
  "id" TEXT PRIMARY KEY,
  "block" BIGINT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "timestamp" BIGINT NOT NULL
);

-- Create indexes as specified in the GraphQL schema
CREATE INDEX "price_block_idx" ON "Price"("block");
CREATE INDEX "price_timestamp_idx" ON "Price"("timestamp");
