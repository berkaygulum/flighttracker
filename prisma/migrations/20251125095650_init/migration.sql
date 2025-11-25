-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FlightRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PriceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "priceTRY" REAL NOT NULL,
    "priceEUR" REAL NOT NULL,
    "airline" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flightDate" DATETIME NOT NULL,
    CONSTRAINT "PriceRecord_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "FlightRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FlightRoute_origin_destination_key" ON "FlightRoute"("origin", "destination");
