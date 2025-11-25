"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import Link from "next/link";

const initialState = {
    error: "",
};

export default function RegisterPage() {
    const [state, formAction] = useActionState(register, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center">Kayıt Ol</h2>
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">E-posta</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Şifre</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {state?.error && (
                        <p className="text-red-400 text-sm text-center">{state.error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Kayıt Ol
                    </button>
                </form>
                <p className="mt-4 text-center text-slate-400 text-sm">
                    Zaten hesabın var mı?{" "}
                    <Link href="/auth/login" className="text-blue-400 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}
