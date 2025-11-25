import { PrismaClient } from "@prisma/client";

export interface FlightOffer {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    priceTRY: number;
    priceEUR: number;
}

const AIRLINES = ["Turkish Airlines", "Pegasus", "Lufthansa", "SunExpress", "Ajet"];
const ORIGINS = ["BRE", "HAM", "HAJ"];
const DESTINATIONS = ["IST", "SAW"];

import amadeus from "./amadeus";

export class FlightService {
    // 1 EUR = 35 TRY (approx for mock)
    private static EXCHANGE_RATE = 35;

    static async searchFlights(
        origin: string,
        destination: string,
        date: Date
    ): Promise<FlightOffer[]> {
        // Use Real Data if credentials exist
        if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
            try {
                const response = await amadeus.shopping.flightOffersSearch.get({
                    originLocationCode: origin,
                    destinationLocationCode: destination,
                    departureDate: date.toISOString().split("T")[0],
                    adults: "1",
                    currencyCode: "EUR",
                    max: 5,
                    nonStop: true // Enforce direct flights
                });

                if (response.data) {
                    return response.data.map((offer: any) => {
                        const segment = offer.itineraries[0].segments[0];
                        const priceEUR = parseFloat(offer.price.total);

                        // Calculate duration in minutes
                        const durationStr = segment.duration; // PT2H50M
                        let duration = 0;
                        const hoursMatch = durationStr.match(/(\d+)H/);
                        const minutesMatch = durationStr.match(/(\d+)M/);
                        if (hoursMatch) duration += parseInt(hoursMatch[1]) * 60;
                        if (minutesMatch) duration += parseInt(minutesMatch[1]);

                        // Format times
                        const departureTime = segment.departure.at.split("T")[1].substring(0, 5);
                        const arrivalTime = segment.arrival.at.split("T")[1].substring(0, 5);

                        return {
                            airline: segment.carrierCode === "TK" ? "Turkish Airlines" :
                                segment.carrierCode === "PC" ? "Pegasus" :
                                    segment.carrierCode === "LH" ? "Lufthansa" :
                                        segment.carrierCode === "XQ" ? "SunExpress" :
                                            segment.carrierCode === "VF" ? "Ajet" : segment.carrierCode,
                            flightNumber: `${segment.carrierCode}${segment.number}`,
                            departureTime,
                            arrivalTime,
                            duration,
                            priceEUR: priceEUR,
                            priceTRY: priceEUR * this.EXCHANGE_RATE, // Amadeus free tier might strictly return EUR
                        };
                    });
                }
            } catch (error) {
                console.error("Amadeus API Error:", error);
                // Fallback to mock if API fails (e.g. rate limit)
            }
        }

        // Mock Data Fallback
        const offers: FlightOffer[] = [];
        const numFlights = Math.floor(Math.random() * 3) + 2; // 2-5 flights

        for (let i = 0; i < numFlights; i++) {
            const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
            const flightNumber = `${airline.substring(0, 2).toUpperCase()}${Math.floor(
                Math.random() * 9000 + 1000
            )}`;

            // Base price between 100-300 EUR
            const basePriceEUR = Math.floor(Math.random() * 200) + 100;
            const priceTRY = basePriceEUR * this.EXCHANGE_RATE;

            const hour = Math.floor(Math.random() * 24);
            const minute = Math.floor(Math.random() * 60);
            const departureTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

            // Random duration between 2h 50m (170m) and 3h 30m (210m)
            const duration = 170 + Math.floor(Math.random() * 40);

            const arrivalDate = new Date();
            arrivalDate.setHours(hour, minute + duration);
            const arrivalTime = `${arrivalDate.getHours().toString().padStart(2, "0")}:${arrivalDate.getMinutes().toString().padStart(2, "0")}`;

            offers.push({
                airline,
                flightNumber,
                departureTime,
                arrivalTime,
                duration,
                priceEUR: basePriceEUR,
                priceTRY: priceTRY,
            });
        }

        return offers;
    }
}
