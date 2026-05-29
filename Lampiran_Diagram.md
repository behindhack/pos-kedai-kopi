# LAMPIRAN DIAGRAM SISTEM
*Aplikasi KopiKasir UMKM*

Berikut adalah lampiran diagram pemodelan sistem (Use Case, ERD, dan Activity Diagram) yang dirender menggunakan format *Mermaid*. Diagram ini sangat penting untuk disertakan pada Bab II (Tinjauan Pustaka) atau Bab III (Metode Penelitian) dalam laporan skripsi/Capstone Anda.

> [!TIP]
> Jika Anda menyalin teks ````mermaid ... ```` ke dalam aplikasi seperti **Notion**, **GitHub**, **GitLab**, atau generator Markdown pendukung Mermaid lainnya, kode ini akan otomatis berubah menjadi gambar grafis diagram. 
> Anda juga dapat menyalin kodenya ke [Mermaid Live Editor (mermaid.live)](https://mermaid.live) untuk mengunduhnya sebagai file gambar (PNG/SVG) yang bisa disisipkan ke Microsoft Word.

---

## 1. Usecase Diagram
Diagram ini memodelkan interaksi antara Aktor (*Owner*, Kasir, Barista) dengan fungsi-fungsi di dalam batasan sistem.

```mermaid
flowchart LR
    %% Definisi Aktor
    Owner((Owner))
    Kasir((Kasir))
    Barista((Barista))

    %% Batasan Sistem (System Boundary)
    subgraph Sistem KopiKasir UMKM
        UC1([Login / Autentikasi])
        UC2([Mengelola Katalog Produk])
        UC3([Mengelola Bahan Baku])
        UC4([Melihat Dasbor & Laporan])
        UC5([Mengelola Akun Pegawai])
        
        UC6([Input Transaksi Penjualan])
        UC7([Mencetak Struk Pembayaran])
        
        UC8([Melihat Antrean Dapur])
        UC9([Mengubah Status Pesanan])
    end

    %% Relasi Aktor ke Usecase
    Owner --> UC1
    Kasir --> UC1
    Barista --> UC1

    Owner --> UC2
    Owner --> UC3
    Owner --> UC4
    Owner --> UC5

    Kasir --> UC6
    Kasir --> UC7
    
    Barista --> UC8
    Barista --> UC9
```

---

## 2. Entity Relationship Diagram (ERD)
Diagram ini memodelkan rancangan basis data (*database*) NoSQL MongoDB yang digunakan dalam aplikasi.

```mermaid
erDiagram
    USERS ||--o{ SALES : "diproses oleh (Kasir)"
    USERS {
        ObjectId _id PK
        string email
        string password_hash
        string name
        string role "OWNER, CASHIER, BARISTA"
        date createdAt
    }
    
    PRODUCTS ||--o{ SALE_ITEMS : "menjadi rincian"
    PRODUCTS {
        ObjectId _id PK
        string name
        number basePrice
        string category
        boolean isAvailable
        string image_url
    }
    
    SALES ||--|{ SALE_ITEMS : "memiliki"
    SALES {
        ObjectId _id PK
        ObjectId cashierId FK
        string cashierName
        number subtotal
        number tax
        number discount
        number grandTotal
        string paymentMethod "CASH, QRIS"
        string status "COMPLETED"
        date createdAt
    }

    SALE_ITEMS {
        ObjectId productId FK
        string productName
        number qty
        number priceAtSale
        string notes
    }
    
    RAW_MATERIALS {
        ObjectId _id PK
        string name
        string category
        number quantity
        number minQuantity
        string unit
        number costPerUnit
    }
```

---

## 3. Activity Diagram (Alur Transaksi Kasir)
Diagram ini menjabarkan alur aktivitas operasional saat Kasir melayani pemesanan pelanggan.

```mermaid
flowchart TD
    Start((Mulai)) --> A[Pelanggan Memesan Menu]
    A --> B(Kasir Menginput Item ke Keranjang)
    B --> C{Pilih Varian Tambahan?}
    
    C -->|Ya| D(Tambahkan Extra Price)
    D --> E
    C -->|Tidak| E(Hitung Subtotal & Pajak)
    
    E --> F(Pilih Metode Pembayaran)
    
    F -->|QRIS| G(Tampilkan QRIS Code)
    G --> I(Validasi Pembayaran Berhasil)
    
    F -->|CASH / TUNAI| H(Kasir Input Nominal Uang)
    H --> H2{Uang Cukup?}
    H2 -->|Kurang| H
    H2 -->|Pas / Lebih| H3(Sistem Hitung Kembalian)
    H3 --> I
    
    I --> J[Simpan Data Penjualan ke Database]
    J --> K(Kirim Order ke Layar Barista)
    K --> End((Selesai))
```

---

## 4. Activity Diagram (Alur Dapur / Barista)
Diagram ini menjabarkan alur aktivitas di dapur setelah pesanan masuk.

```mermaid
flowchart TD
    Start((Pesanan Baru Masuk)) --> A[Tampil di Layar Antrean Dapur]
    A --> B(Barista Memilih Pesanan)
    B --> C(Ubah Status menjadi PREPARING)
    C --> D[Meracik Minuman/Makanan]
    D --> E{Racikan Selesai?}
    E -->|Belum| D
    E -->|Sudah| F(Ubah Status menjadi READY)
    F --> G(Serahkan Pesanan ke Pelanggan)
    G --> End((Selesai))
```
