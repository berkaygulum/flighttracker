import cron from "node-cron";
import { PriceTracker } from "./lib/price-tracker";
import { EmailService } from "./lib/email-service";
import { prisma } from "./lib/prisma";

console.log("Scheduler started...");

// Daily Price Check at 10:00 AM
cron.schedule("0 10 * * *", async () => {
    console.log("Running daily price check...");
    try {
        await PriceTracker.trackPrices();
    } catch (error) {
        console.error("Error in daily price check:", error);
    }
});

// Weekly Email on Monday at 09:00 AM
cron.schedule("0 9 * * 1", async () => {
    console.log("Sending weekly emails...");
    try {
        const users = await prisma.user.findMany();
        const routes = await prisma.flightRoute.findMany();
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const flightData = [];

        for (const route of routes) {
            // Get latest prices for the next 30 days
            const latestPrices = await prisma.priceRecord.findMany({
                where: {
                    routeId: route.id,
                    recordedAt: { gte: new Date(today.setHours(0, 0, 0, 0)) },
                },
                orderBy: { recordedAt: "desc" },
                distinct: ["flightDate"], // One record per flight date
            });

            for (const latest of latestPrices) {
                // Find price from ~7 days ago for the same flight date
                const oldPrice = await prisma.priceRecord.findFirst({
                    where: {
                        routeId: route.id,
                        flightDate: latest.flightDate,
                        recordedAt: {
                            gte: new Date(sevenDaysAgo.setHours(0, 0, 0, 0)),
                            lt: new Date(sevenDaysAgo.setHours(23, 59, 59, 999)),
                        },
                    },
                    orderBy: { recordedAt: "desc" },
                });

                flightData.push({
                    route,
                    current: latest,
                    old: oldPrice,
                    changeTRY: oldPrice ? latest.priceTRY - oldPrice.priceTRY : 0,
                    changeEUR: oldPrice ? latest.priceEUR - oldPrice.priceEUR : 0,
                });
            }
        }

        // Filter only significant changes or just send all? 
        // Sending all for now as per "weekly report" request.

        if (flightData.length > 0) {
            for (const user of users) {
                console.log(`Sending email to ${user.email}`);
                await EmailService.sendWeeklyReport(user.email, flightData);
            }
        }
    } catch (error) {
        console.error("Error in weekly email job:", error);
    }
});

// Daily Price Alert Check at 10:30 AM
cron.schedule("30 10 * * *", async () => {
    console.log("Checking price alerts...");
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alerts = await prisma.priceAlert.findMany({
            where: {
                targetDate: { gte: today },
            },
            include: {
                user: true,
                route: true,
            },
        });

        for (const alert of alerts) {
            // Find cheapest flight for this route and date
            const cheapestRecord = await prisma.priceRecord.findFirst({
                where: {
                    routeId: alert.routeId,
                    flightDate: alert.targetDate,
                },
                orderBy: { priceTRY: "asc" },
            });

            if (cheapestRecord) {
                const dateStr = new Date(alert.targetDate).toLocaleDateString("tr-TR");
                const priceStr = `${cheapestRecord.priceTRY.toFixed(2)} TRY`;

                await EmailService.sendPriceAlert(
                    alert.user.email,
                    `${alert.route.origin} - ${alert.route.destination}`,
                    dateStr,
                    priceStr,
                    cheapestRecord.airline
                );
            }
        }
    } catch (error) {
        console.error("Error in price alert job:", error);
    }
});
