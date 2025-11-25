import { PriceTracker } from "../lib/price-tracker";
import { EmailService } from "../lib/email-service";
import { prisma } from "../lib/prisma";

async function verify() {
    console.log("--- Starting Verification ---");

    // 1. Verify Price Tracking
    console.log("\n1. Testing Price Tracker...");
    await PriceTracker.trackPrices();

    const count = await prisma.priceRecord.count();
    console.log(`✅ Price records found: ${count}`);
    if (count === 0) throw new Error("No price records created!");

    // 2. Verify Email Service
    console.log("\n2. Testing Email Service...");
    await EmailService.sendWeeklyReport("test@example.com", [
        {
            route: { origin: "BRE", destination: "IST" },
            current: {
                priceTRY: 3500,
                priceEUR: 100,
                airline: "Test Airline",
                flightDate: new Date(),
            },
            old: {
                priceTRY: 4000,
                priceEUR: 115,
            },
            changeTRY: -500,
            changeEUR: -15,
        },
    ]);
    console.log("✅ Email test completed (check console for preview URL)");

    console.log("\n--- Verification Successful ---");
}

verify()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
