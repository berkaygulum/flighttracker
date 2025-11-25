import { prisma } from "@/lib/prisma";
import { FlightService } from "./flight-service";

const ROUTES = [
    { origin: "BRE", destination: "IST" },
    { origin: "BRE", destination: "SAW" },
    { origin: "HAM", destination: "IST" },
    { origin: "HAM", destination: "SAW" },
    { origin: "HAJ", destination: "IST" },
    { origin: "HAJ", destination: "SAW" },
    // Return Routes
    { origin: "IST", destination: "BRE" },
    { origin: "SAW", destination: "BRE" },
    { origin: "IST", destination: "HAM" },
    { origin: "SAW", destination: "HAM" },
    { origin: "IST", destination: "HAJ" },
    { origin: "SAW", destination: "HAJ" },
];

export class PriceTracker {
    static async ensureRoutesExist() {
        for (const route of ROUTES) {
            await prisma.flightRoute.upsert({
                where: {
                    origin_destination: {
                        origin: route.origin,
                        destination: route.destination,
                    },
                },
                update: {},
                create: {
                    origin: route.origin,
                    destination: route.destination,
                },
            });
        }
    }

    static async trackPrices() {
        await this.ensureRoutesExist();
        console.log("Starting price tracking...");

        const routes = await prisma.flightRoute.findMany();
        const today = new Date();

        for (const route of routes) {
            console.log(`Checking ${route.origin} -> ${route.destination}`);

            // Check for the next 67 days (until Jan 31, 2026)
            for (let i = 0; i < 67; i++) {
                const flightDate = new Date(today);
                flightDate.setDate(today.getDate() + i);

                const offers = await FlightService.searchFlights(
                    route.origin,
                    route.destination,
                    flightDate
                );

                // Add delay to avoid rate limits (1s)
                await new Promise(resolve => setTimeout(resolve, 1000));

                for (const offer of offers) {
                    await prisma.priceRecord.create({
                        data: {
                            routeId: route.id,
                            priceTRY: offer.priceTRY,
                            priceEUR: offer.priceEUR,
                            airline: offer.airline,
                            flightNumber: offer.flightNumber,
                            departureTime: offer.departureTime,
                            duration: offer.duration,
                            flightDate: flightDate,
                        },
                    });
                }
            }
        }
        console.log("Price tracking complete.");
    }
}
