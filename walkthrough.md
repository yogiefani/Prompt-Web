# Webhook Lynk.id & Auto-Access Selesai 🚀

Sistem webhook untuk **Lynk.id** telah berhasil diimplementasikan! Sekarang setiap transaksi dari Lynk.id akan secara instan membukakan akun dan memberikan hak akses ke aplikasi Anda tanpa pengguna harus repot memverifikasi email melalui Gmail.

## Alur yang Telah Dibuat:

1. **Endpoint API:** `https://www.promptvault.codes/api/webhooks/lynk`
   Ini adalah *URL tujuan Webhook* yang harus Anda masukkan di Dashboard **Lynk.id** (di menu Settings > Integrations > Webhook).
2. **Validasi Keamanan:**
   Pastikan Anda memasukkan URL Webhook di Lynk.id dengan tambahan parameter `?secret=bebas-apa-saja` (sesuai nilai `PRODUCT_WEBHOOK_SECRET` di `.env.local` Anda).
   > [!IMPORTANT]
   > **URL Lengkap Webhook Anda:** 
   > `https://www.promptvault.codes/api/webhooks/lynk?secret=bebas-apa-saja`
3. **Password Default:**
   Sistem otomatis membuatkan akun pembeli dengan password: **`Prompt2024!`**.
   Akun tersebut langsung diaktifkan menggunakan *Bypass Email Confirmation* Supabase.
4. **Pemberian Akses:**
   Setelah akun terbuat (atau jika akun sudah ada), email pembeli akan diinjeksi ke dalam tabel **`access_grants`** dengan status `granted` dan mencatat bahwa *provider* aksesnya adalah `lynk_id`.

## Cara Setting di Dashboard Lynk.id

1. Buka produk Anda di dashboard **Lynk.id**.
2. Masuk ke pengaturan **Pesan Terima Kasih (Thank You Message / Post-checkout Message)**.
3. Tuliskan pesan berikut untuk memberi tahu pembeli akses mereka:
   > *"Terima kasih telah membeli! Silakan login ke **https://www.promptvault.codes/login** menggunakan email pembelian ini dan masukkan password sementara: **Prompt2024!**. Jangan lupa segera ganti password Anda setelah berhasil masuk."*
4. Terakhir, masuk ke menu **Settings > Integrations > Webhook** di Lynk.id Anda, lalu paste URL lengkap berikut:
   `https://www.promptvault.codes/api/webhooks/lynk?secret=bebas-apa-saja`

> [!TIP]
> Jika ada yang perlu disesuaikan (misal Anda ingin mengubah password defaultnya menjadi yang lain), Anda bisa mengubahnya langsung di file `src/app/api/webhooks/lynk/route.ts` pada baris ke-26.
