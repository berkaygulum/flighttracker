-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PriceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "priceTRY" REAL NOT NULL,
    "priceEUR" REAL NOT NULL,
    "airline" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL DEFAULT '00:00',
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flightDate" DATETIME NOT NULL,
    CONSTRAINT "PriceRecord_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "FlightRoute" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PriceRecord" ("airline", "flightDate", "flightNumber", "id", "priceEUR", "priceTRY", "recordedAt", "routeId") SELECT "airline", "flightDate", "flightNumber", "id", "priceEUR", "priceTRY", "recordedAt", "routeId" FROM "PriceRecord";
DROP TABLE "PriceRecord";
ALTER TABLE "new_PriceRecord" RENAME TO "PriceRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
