-- CreateTable
CREATE TABLE "PriceAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "targetDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PriceAlert_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "FlightRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PriceAlert_userId_idx" ON "PriceAlert"("userId");

-- CreateIndex
CREATE INDEX "PriceAlert_routeId_idx" ON "PriceAlert"("routeId");
