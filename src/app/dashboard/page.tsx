import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId");

    if (!userId) {
        redirect("/auth/login");
    }

    const routes = await prisma.flightRoute.findMany({
        include: {
            records: {
                orderBy: { recordedAt: "asc" },
            },
        },
    });

    return <DashboardClient routes={routes} />;
}
