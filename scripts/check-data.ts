import { prisma } from "../lib/prisma";

async function checkData() {
    const count = await prisma.priceRecord.count();
    console.log(`Total PriceRecords: ${count}`);

    if (count > 0) {
        const first = await prisma.priceRecord.findFirst({ orderBy: { flightDate: 'asc' } });
        const last = await prisma.priceRecord.findFirst({ orderBy: { flightDate: 'desc' } });
        console.log(`Date Range: ${first?.flightDate} - ${last?.flightDate}`);

        const sample = await prisma.priceRecord.findFirst({ take: 1 });
        console.log("Sample Record:", sample);
    } else {
        console.log("Database is empty!");
    }
}

checkData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
