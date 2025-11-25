"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { logout } from "@/app/actions/auth";
import { createPriceAlert } from "@/app/actions/alerts";

interface PriceRecord {
    id: number;
    priceTRY: number;
    priceEUR: number;
    airline: string;
    flightNumber: string;
    departureTime: string;
    duration: number;
    flightDate: Date;
    recordedAt: Date;
}

interface RouteData {
    id: string;
    origin: string;
    destination: string;
    records: PriceRecord[];
}

export default function DashboardClient({ routes }: { routes: any[] }) {
    const [currency, setCurrency] = useState<"TRY" | "EUR">("TRY");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [appliedStartDate, setAppliedStartDate] = useState<string>("");
    const [appliedEndDate, setAppliedEndDate] = useState<string>("");

    const handleLogout = async () => {
        await logout();
    };

    const handleApplyFilter = () => {
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
    };

    const handleTrackDate = async (routeId: string, date: Date) => {
        const result = await createPriceAlert(routeId, date);
        if (result.success) {
            alert("Fiyat alarmı oluşturuldu! Bu tarih için en uygun fiyat size e-posta ile bildirilecek.");
        } else {
            alert(result.message);
        }
    };

    const outboundRoutes = routes.filter(r => ["BRE", "HAM", "HAJ"].includes(r.origin));
    const inboundRoutes = routes.filter(r => ["IST", "SAW"].includes(r.origin));

    // Multi-city Optimization Logic (Weekend Trip: Fri > 18:00 -> Sun)
    const getBestMultiCityOption = () => {
        if (!appliedStartDate || !appliedEndDate) return null;

        let bestOption = null;
        let minTotal = Infinity;

        // Find cheapest outbound (Friday > 18:00)
        for (const outRoute of outboundRoutes) {
            const outRecords = outRoute.records.filter((r: PriceRecord) => {
                const d = new Date(r.flightDate);
                const isFriday = d.getDay() === 5;

                const parts = r.departureTime.split(":");
                const hour = parseInt(parts[0], 10);
                const isAfter18 = !isNaN(hour) && hour >= 18;

                // Debug log for specific date
                if (r.flightDate.toString().includes("2026-01-16")) {
                    console.log(`Checking flight: ${r.departureTime}, Hour: ${hour}, IsFriday: ${isFriday}, IsAfter18: ${isAfter18}`);
                }

                return d >= new Date(appliedStartDate) && d <= new Date(appliedEndDate) && isFriday && isAfter18;
            });

            for (const outRecord of outRecords) {
                // Find cheapest inbound (Sunday) EXACTLY 2 days after outbound
                const outDate = new Date(outRecord.flightDate);
                const targetReturnDate = new Date(outDate);
                targetReturnDate.setDate(outDate.getDate() + 2);

                for (const inRoute of inboundRoutes) {
                    const inRecords = inRoute.records.filter((r: PriceRecord) => {
                        const d = new Date(r.flightDate);
                        // Check if date matches targetReturnDate (ignoring time)
                        return d.getDate() === targetReturnDate.getDate() &&
                            d.getMonth() === targetReturnDate.getMonth() &&
                            d.getFullYear() === targetReturnDate.getFullYear();
                    });

                    for (const inRecord of inRecords) {
                        const total = (currency === "TRY" ? outRecord.priceTRY : outRecord.priceEUR) +
                            (currency === "TRY" ? inRecord.priceTRY : inRecord.priceEUR);

                        if (total < minTotal) {
                            minTotal = total;
                            bestOption = { outbound: { ...outRecord, route: outRoute }, inbound: { ...inRecord, route: inRoute }, total };
                        }
                    }
                }
            }
        }
        return bestOption;
    };

    const bestMultiCity = getBestMultiCityOption();

    const renderRouteCard = (route: any) => {
        // Filter records based on date range
        const filteredRecords = route.records.filter((r: PriceRecord) => {
            if (!appliedStartDate && !appliedEndDate) return true;
            const flightDate = new Date(r.flightDate);
            const start = appliedStartDate ? new Date(appliedStartDate) : new Date("1970-01-01");
            const end = appliedEndDate ? new Date(appliedEndDate) : new Date("2099-12-31");
            return flightDate >= start && flightDate <= end;
        });

        if (filteredRecords.length === 0) return null;

        return (
            <div
                key={route.id}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">
                        {route.origin} - {route.destination}
                    </h2>
                    {(() => {
                        const cheapestRecord = filteredRecords.reduce((min: PriceRecord, current: PriceRecord) => {
                            const minPrice = currency === "TRY" ? min.priceTRY : min.priceEUR;
                            const currentPrice = currency === "TRY" ? current.priceTRY : current.priceEUR;
                            return currentPrice < minPrice ? current : min;
                        }, filteredRecords[0]);

                        if (!cheapestRecord) return null;

                        return (
                            <div className="flex items-center gap-4">
                                <div className="bg-green-900/30 border border-green-500/50 px-4 py-2 rounded-lg flex items-center gap-3">
                                    <span className="text-green-400 font-bold text-sm uppercase tracking-wider">En Uygun:</span>
                                    <span className="text-white font-semibold">
                                        {new Date(cheapestRecord.flightDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", weekday: "long" })} {cheapestRecord.departureTime.replace(":", ".")}
                                    </span>
                                    <span className="text-white font-bold text-lg">
                                        {currency === "TRY" ? `${cheapestRecord.priceTRY.toFixed(0)} ₺` : `${cheapestRecord.priceEUR.toFixed(0)} €`}
                                    </span>
                                    <span className={`font-bold ${cheapestRecord.airline.includes("Turkish") ? "text-red-400" :
                                        cheapestRecord.airline.includes("Pegasus") ? "text-yellow-400" :
                                            cheapestRecord.airline.includes("Lufthansa") ? "text-blue-400" :
                                                cheapestRecord.airline.includes("Ajet") ? "text-indigo-400" :
                                                    "text-orange-400"
                                        }`}>
                                        {cheapestRecord.airline}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleTrackDate(route.id, cheapestRecord.flightDate)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    <span>Takip Et</span>
                                </button>
                            </div>
                        );
                    })()}
                </div>

                <div className="h-[300px] w-full mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={(() => {
                                // Group data by date
                                const dateMap = new Map<string, any>();
                                filteredRecords.forEach((r: PriceRecord) => {
                                    const date = new Date(r.flightDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
                                    if (!dateMap.has(date)) {
                                        dateMap.set(date, { date });
                                    }
                                    const dateData = dateMap.get(date);
                                    const price = currency === "TRY" ? r.priceTRY : r.priceEUR;

                                    // Store lowest price for each airline on this date
                                    const airlineKey = r.airline;
                                    if (!dateData[airlineKey] || price < dateData[airlineKey]) {
                                        dateData[airlineKey] = price;
                                    }
                                });
                                return Array.from(dateMap.values()).sort((a, b) => {
                                    const dateA = new Date(a.date.split('.').reverse().join('-'));
                                    const dateB = new Date(b.date.split('.').reverse().join('-'));
                                    return dateA.getTime() - dateB.getTime();
                                });
                            })()}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                wrapperStyle={{ outline: "none" }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div
                                                className="border border-slate-200 p-4 rounded-lg shadow-2xl z-50 min-w-[150px]"
                                                style={{ backgroundColor: "white", opacity: 1 }}
                                            >
                                                <p className="text-slate-500 text-sm mb-1">{label}</p>
                                                {payload.map((entry: any, index: number) => (
                                                    <div key={index} className="flex justify-between items-center gap-3 mb-1">
                                                        <span className="font-semibold" style={{ color: entry.color }}>{entry.name}</span>
                                                        <span className="font-bold text-slate-900">
                                                            {currency === "TRY" ? `${entry.value.toFixed(0)} ₺` : `${entry.value.toFixed(0)} €`}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="Turkish Airlines"
                                name="Turkish Airlines"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#ef4444" }}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="Pegasus"
                                name="Pegasus"
                                stroke="#fbbf24"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#fbbf24" }}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="Lufthansa"
                                name="Lufthansa"
                                stroke="#60a5fa"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#60a5fa" }}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="Ajet"
                                name="Ajet"
                                stroke="#818cf8"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#818cf8" }}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="SunExpress"
                                name="SunExpress"
                                stroke="#fb923c"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#fb923c" }}
                                connectNulls
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-300 mb-4">Uçuş Listesi</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredRecords.slice(0, 8).map((record: PriceRecord, idx: number) => {
                            const airlineColor =
                                record.airline.includes("Turkish") ? "text-red-500" :
                                    record.airline.includes("Pegasus") ? "text-yellow-400" :
                                        record.airline.includes("Lufthansa") ? "text-blue-400" :
                                            record.airline.includes("Ajet") ? "text-indigo-400" :
                                                "text-orange-400";

                            const borderColor =
                                record.airline.includes("Turkish") ? "border-red-500/30" :
                                    record.airline.includes("Pegasus") ? "border-yellow-400/30" :
                                        record.airline.includes("Lufthansa") ? "border-blue-400/30" :
                                            record.airline.includes("Ajet") ? "border-indigo-400/30" :
                                                "border-orange-400/30";

                            const durationHours = Math.floor(record.duration / 60);
                            const durationMinutes = record.duration % 60;

                            return (
                                <div
                                    key={idx}
                                    id={`record-${record.id}`}
                                    className={`bg-slate-700 p-4 rounded-xl border ${borderColor} hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/10`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                            {new Date(record.flightDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(record.recordedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        </span>
                                    </div>
                                    <p className={`font-bold text-lg mb-1 ${airlineColor}`}>
                                        {record.airline}
                                    </p>
                                    <div className="flex justify-between items-center text-sm text-slate-300 mb-2">
                                        <span>{record.flightNumber}</span>
                                        <span className="bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded text-xs border border-blue-500/30">Direkt</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
                                        <span>{record.departureTime}</span>
                                        <div className="h-[1px] bg-slate-600 flex-1 mx-2"></div>
                                        <span>{durationHours}s {durationMinutes}dk</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-600 flex justify-between items-end">
                                        <span className="text-2xl font-bold text-white">
                                            {currency === "TRY" ? `${record.priceTRY.toFixed(0)} ₺` : `${record.priceEUR.toFixed(0)} €`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const AIRLINE_URLS: { [key: string]: string } = {
        "Turkish Airlines": "https://www.turkishairlines.com",
        "Pegasus": "https://www.flypgs.com",
        "Ajet": "https://ajet.com",
        "Lufthansa": "https://www.lufthansa.com",
        "SunExpress": "https://www.sunexpress.com",
    };

    const handleSelectPackage = () => {
        if (!bestMultiCity) return;

        const outboundUrl = AIRLINE_URLS[bestMultiCity.outbound.airline] || "https://www.google.com/flights";
        const inboundUrl = AIRLINE_URLS[bestMultiCity.inbound.airline] || "https://www.google.com/flights";

        window.open(outboundUrl, "_blank");
        window.open(inboundUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Uçuş Takip Paneli</h1>
                    <div className="flex gap-4 items-center">
                        <div className="flex gap-2 items-center bg-slate-800 p-2 rounded-lg border border-slate-700">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-slate-700 text-white px-3 py-1 rounded outline-none text-sm"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-slate-700 text-white px-3 py-1 rounded outline-none text-sm"
                            />
                            <button
                                onClick={handleApplyFilter}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors ml-2"
                            >
                                Filtrele
                            </button>
                        </div>
                        <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
                            <button
                                onClick={() => setCurrency("TRY")}
                                className={`px-4 py-1 rounded-md transition-all ${currency === "TRY" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                            >
                                TRY
                            </button>
                            <button
                                onClick={() => setCurrency("EUR")}
                                className={`px-4 py-1 rounded-md transition-all ${currency === "EUR" ? "bg-blue-600 text-white" : "text-slate-400"}`}
                            >
                                EUR
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {(!appliedStartDate || !appliedEndDate) ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-slate-400 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-slate-300 mb-2">Tarih Aralığı Seçiniz</h2>
                            <p className="text-slate-500">Verileri ve grafikleri görüntülemek için lütfen yukarıdan bir tarih aralığı seçip "Filtrele" butonuna basınız.</p>
                        </div>
                    ) : (
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-blue-400 mb-6 border-b border-blue-500/30 pb-2">Gidiş Rotaları (Almanya &rarr; Türkiye)</h2>
                            {outboundRoutes.map(renderRouteCard)}

                            <h2 className="text-2xl font-bold text-orange-400 mb-6 mt-12 border-b border-orange-500/30 pb-2">Dönüş Rotaları (Türkiye &rarr; Almanya)</h2>
                            {inboundRoutes.map(renderRouteCard)}
                        </div>
                    )}

                    {/* Multi-city Recommendation Panel */}
                    {bestMultiCity && (
                        <div className="w-[350px] shrink-0">
                            <div className="sticky top-8 bg-slate-800 p-6 rounded-2xl border border-yellow-500/50 shadow-2xl shadow-yellow-500/10">
                                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                                    <span>✨ En Uygun Hafta Sonu Rotasyonu</span>
                                </h3>
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="absolute -left-3 top-2 w-1 h-full bg-slate-700 rounded-full"></div>

                                        {/* Outbound */}
                                        <div className="pl-4 pb-6 border-l-2 border-blue-500/30 ml-[-1px]">
                                            <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">Gidiş</div>
                                            <div className="font-bold text-white text-lg">{bestMultiCity.outbound.route.origin} ➔ {bestMultiCity.outbound.route.destination}</div>
                                            <div className="text-slate-400 text-sm mb-1">
                                                {new Date(bestMultiCity.outbound.flightDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} <span className="text-slate-300 font-bold ml-1">{bestMultiCity.outbound.departureTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-bold">
                                                    {currency === "TRY" ? `${bestMultiCity.outbound.priceTRY.toFixed(0)} ₺` : `${bestMultiCity.outbound.priceEUR.toFixed(0)} €`}
                                                </span>
                                                <span className="text-xs text-slate-500">{bestMultiCity.outbound.airline}</span>
                                            </div>
                                        </div>

                                        {/* Inbound */}
                                        <div className="pl-4 border-l-2 border-orange-500/30 ml-[-1px]">
                                            <div className="text-xs text-orange-400 font-bold mb-1 uppercase tracking-wider">Dönüş</div>
                                            <div className="font-bold text-white text-lg">{bestMultiCity.inbound.route.origin} ➔ {bestMultiCity.inbound.route.destination}</div>
                                            <div className="text-slate-400 text-sm mb-1">
                                                {new Date(bestMultiCity.inbound.flightDate).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} <span className="text-slate-300 font-bold ml-1">{bestMultiCity.inbound.departureTime}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-white font-bold">
                                                    {currency === "TRY" ? `${bestMultiCity.inbound.priceTRY.toFixed(0)} ₺` : `${bestMultiCity.inbound.priceEUR.toFixed(0)} €`}
                                                </span>
                                                <span className="text-xs text-slate-500">{bestMultiCity.inbound.airline}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-700">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-slate-400">Toplam Tutar</span>
                                            <span className="text-3xl font-bold text-white">
                                                {currency === "TRY" ? `${bestMultiCity.total.toFixed(0)} ₺` : `${bestMultiCity.total.toFixed(0)} €`}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleSelectPackage}
                                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl transition-colors"
                                        >
                                            Bu Paketi Seç
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
