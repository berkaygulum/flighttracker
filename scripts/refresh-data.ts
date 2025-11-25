import { prisma } from "@/lib/prisma";
import { PriceTracker } from "@/lib/price-tracker";

async function refreshData() {
    console.log("Clearing existing price records...");
    await prisma.priceRecord.deleteMany({});
    console.log("Records cleared.");

    console.log("Regenerating flight data...");
    await PriceTracker.trackPrices();
    console.log("Data regeneration complete.");
}

refreshData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
