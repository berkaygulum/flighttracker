"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function register(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: "User already exists" };
        }

        const hashedPassword = await hashPassword(password);
        await prisma.user.create({
            data: { email, password: hashedPassword },
        });
    } catch (error) {
        console.error("Registration Error:", error);
        return { error: "Registration failed" };
    }

    redirect("/auth/login");
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await verifyPassword(password, user.password))) {
            return { error: "Invalid credentials" };
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("userId", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
    } catch (error) {
        return { error: "Login failed" };
    }

    redirect("/dashboard");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    redirect("/");
}
