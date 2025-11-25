import Link from "next/link";
import { Plane, TrendingDown, Mail } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Hero Section */}
            <header className="container mx-auto px-6 py-16 text-center">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
                    Uçuş Fiyatlarını Takip Edin
                </h1>
                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                    Bremen, Hamburg ve Hannover'den İstanbul'a olan uçuşları otomatik olarak
                    tarıyoruz. Fiyatlar düştüğünde sizi haberdar ediyoruz.
                </p>
                <div className="flex justify-center gap-8">
                    <Link
                        href="/auth/register"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-blue-500/25 inline-block"
                    >
                        Kaydol
                    </Link>
                    <Link
                        href="/auth/login"
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg inline-block"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </header>

            {/* Features */}
            <section className="container mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center flex flex-col items-center">
                    <Plane className="w-12 h-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Otomatik Takip</h3>
                    <p className="text-slate-400">
                        Her gün düzenli olarak tüm havayollarını tarıyor ve fiyatları
                        kaydediyoruz.
                    </p>
                </div>
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center flex flex-col items-center">
                    <TrendingDown className="w-12 h-12 text-teal-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Fiyat Analizi</h3>
                    <p className="text-slate-400">
                        Geçmiş fiyat verileriyle en uygun zamanı yakalamanızı sağlıyoruz.
                    </p>
                </div>
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center flex flex-col items-center">
                    <Mail className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Haftalık Rapor</h3>
                    <p className="text-slate-400">
                        Her hafta e-posta kutunuza detaylı fiyat raporu gönderiyoruz.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-8 text-center text-slate-500 text-sm">
                <p>by Berkay Gülüm</p>
            </footer>
        </div>
    );
}
