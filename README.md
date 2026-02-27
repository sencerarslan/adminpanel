# Admin Panel Project

Bu proje, **.agents** kullanılarak verimli bir şekilde bir full stack admin panelinin geliştirilmesi ve [Vercel](https://vercel.com) üzerinde hızlıca deploy edilmesi amacıyla oluşturulmuştur.

## 🚀 Projenin Amacı

Yapay zeka asistanları (AI agents) kullanılarak uçtan uca, modern bir web projesinin nasıl inşa edilebileceğini göstermek temel amacımızdır. Yapılandırmalar, veritabanı şemaları, API rotaları ve tasarımsal süreçlerin hepsi standardize edilmiş sistem kurallarına (memory rules) uygun şekilde bir asistan eşliğinde kodlanmış ve yayına alınmıştır.

## 🛠️ Teknolojiler ve Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Veritabanı ORM:** [Prisma](https://www.prisma.io/)
- **Veritabanı:** Vercel Postgres / Neon  
- **Stil & UI:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **State Yönetimi:** [Zustand](https://zustand-demo.pmnd.rs/) (Client), [TanStack Query](https://tanstack.com/query/latest) (Server)
- **Doğrulama (Auth):** HTTP-Only Cookies, JWT ve Rol/Sayfa Bâzlı Erişim (RBAC)
- **Dağıtım (Deployment):** Vercel

## 📦 Kurulum ve Çalıştırma

### 1. Vercel Entegrasyonu

Projenin veritabanı değişkenleri Vercel üzerinden alınmaktadır:
```bash
npx vercel link
npx vercel env pull .env
```

### 2. Geliştirme Ortamını Başlatma

Veritabanı şemasını uygulayın ve varsayılan verileri yükleyin (seed):
```bash
npx prisma migrate dev
npx prisma db seed
```

Projeyi ayağa kaldırın:
```bash
pnpm install
pnpm dev
```

### 3. Docker ile Çalıştırma

Projenin Next.js kısmını Docker konteyneri içinde başlatmak ve Vercel'deki veritabanına doğrudan bağlanmak isterseniz:
```bash
docker compose -f docker-compose.vercel.yml up -d --build
```
Proje `http://localhost:3000` adresinde çalışacaktır.

## 👥 Varsayılan Kullanıcılar
(Veritabanı seed komutu çalıştırdığınızda oluşur)
- **Süper Admin:** admin@adminpanel.com / `admin123`
- **Editör:** editor@adminpanel.com / `editor123`

> 💡 **Canlı Demo Girişi:** Canlıdaki projeyi test etmek için aşağıdaki bilgileri kullanabilirsiniz:
> - **E-posta:** `admin@adminpanel.com`
> - **Şifre:** `admin123`

## 💬 Katkı Belirtme
Bu proje, geliştirici asistanlarına bir kural dosyası (`.agents` / `memory`) seti sunularak tamamen otomatik bir sistematiğe bağlanmıştır ve standartların dışına çıkılmamasına çok dikkat edilmiştir.
