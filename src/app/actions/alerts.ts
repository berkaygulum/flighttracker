"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPriceAlert(routeId: string, targetDate: Date) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
        return { success: false, message: "Kullanıcı girişi yapılmamış." };
    }

    try {
        await prisma.priceAlert.create({
            data: {
                userId,
                routeId,
                targetDate,
            },
        });

        revalidatePath("/dashboard");
        return { success: true, message: "Fiyat alarmı oluşturuldu." };
    } catch (error) {
        console.error("Error creating alert:", error);
        return { success: false, message: "Alarm oluşturulurken bir hata oluştu." };
    }
}
