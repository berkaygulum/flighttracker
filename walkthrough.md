# Flight Tracker App Walkthrough

Uçuş Takip Uygulaması başarıyla oluşturuldu. Bu uygulama Bremen, Hamburg ve Hannover'den İstanbul'a olan uçuş fiyatlarını takip eder, kaydeder ve haftalık raporlar gönderir.

## Özellikler
- **Kullanıcı Kayıt/Giriş**: E-posta ve şifre ile güvenli giriş.
- **Fiyat Takibi**: Mock (sahte) veri servisi ile **30 günlük** fiyat değişimlerini simüle eder.
- **Dashboard**: Uçuş fiyatlarını grafik üzerinde görüntüleme.
- **Para Birimi**: TRY ve EUR arasında geçiş yapabilme.
- **E-posta Bildirimleri**: Haftalık otomatik raporlar. **Fiyat değişimlerini (7 gün öncesine göre) gösterir ve buton şeklinde linkler içerir.**

## Kurulum ve Çalıştırma

1. **Bağımlılıkları Yükleyin**:
   ```bash
   cd flight-tracker
   npm install
   ```

2. **Veritabanını Hazırlayın**:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Uygulamayı Başlatın**:
   ```bash
   npm run dev
   ```
   Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Doğrulama Adımları

### 1. Kullanıcı Kaydı
- `http://localhost:3000/auth/register` adresine gidin.
- Bir e-posta ve şifre girerek kayıt olun.
- Giriş sayfasına yönlendirileceksiniz.

### 2. Dashboard ve Fiyatlar
- Giriş yaptıktan sonra Dashboard'a yönlendirileceksiniz.
- Başlangıçta veri olmayabilir. Veri oluşturmak için **Cron Job**'ı manuel tetikleyebilir veya bir süre bekleyebilirsiniz (Mock servisi her çağrıldığında veri üretir).
- **İpucu**: Veri oluşturmak için `lib/price-tracker.ts` içindeki `trackPrices` fonksiyonunu geçici olarak bir butona bağlayabilir veya `scripts/verify-backend.ts` dosyasını (Prisma hatası giderildikten sonra) çalıştırabilirsiniz.
- Dashboard'da "TRY" ve "EUR" butonlarını kullanarak para birimini değiştirin.

### 3. E-posta Testi
- Uygulama arka planda haftalık e-posta gönderir.
- Geliştirme ortamında bu e-postalar konsola "Preview URL" olarak yazdırılır.

## Notlar
- **Mock Veri**: Gerçek uçuş verileri yerine rastgele üretilen veriler kullanılmaktadır.
- **Veritabanı**: SQLite (`dev.db`) kullanılmaktadır.
- **Prisma**: Veritabanı şeması `prisma/schema.prisma` dosyasındadır.
