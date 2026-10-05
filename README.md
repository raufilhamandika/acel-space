# For Acel, with love ♡

Website kecil yang dibuat sebagai hadiah ulang tahun untuk Acel—berisi
kenangan, foto-foto pilihan, wishes, dan surat yang bisa dibuka dari amplop
interaktif.

**Lihat website:** <https://raufilhamandika.github.io/acel-space/>

## Yang ada di dalamnya

- Halaman pembuka dengan kode kejutan
- Ucapan dan cerita singkat tentang kenangan
- Galeri foto yang bisa dibuka untuk melihat gambar lebih dekat
- Amplop interaktif dengan segel foto dan surat pribadi
- Kartu wishes yang bisa dipilih
- Lilin ulang tahun interaktif
- Animasi lembut dan tampilan yang menyesuaikan layar ponsel

## Dibuat dengan

Website ini menggunakan HTML, CSS, dan JavaScript biasa—tanpa framework atau
paket tambahan.

## Menjalankan di komputer

1. Unduh atau clone repository ini.
2. Buka folder proyek.
3. Buka `index.html` di browser.

Atau, jalankan server lokal dari terminal di folder proyek:

```powershell
py -m http.server 8000
```

Kemudian kunjungi <http://localhost:8000>.

## Mengubah isi website

- **Tulisan dan susunan halaman:** edit `index.html`. Cari komentar HTML untuk
  menemukan bagian pembuka, kenangan, galeri, surat, dan wishes.
- **Foto:** letakkan foto di `assets/`, lalu ubah alamat `src` di `index.html`.
  Untuk foto galeri, samakan juga alamat pada `data-image` agar gambar yang
  diperbesar tetap benar. Sesuaikan teks `alt` untuk menjelaskan foto.
- **Segel amplop:** ganti `assets/letter-seal.png` dengan gambar pilihanmu.
- **Warna, tata letak, dan animasi:** edit `styles.css`. Bagian-bagian utamanya
  ditandai dengan komentar.
- **Interaksi dan kode kejutan:** edit `script.js`. Kode pembuka disimpan di
  sisi browser, jadi hanya berfungsi sebagai kejutan—bukan pengaman informasi
  pribadi.

## File proyek

```text
.
├── assets/       # Foto dan gambar yang digunakan website
├── index.html    # Konten dan susunan halaman
├── script.js     # Interaksi website
├── styles.css    # Tampilan dan animasi
└── README.md     # Panduan proyek
```

Font dari Google Fonts memerlukan koneksi internet. Jika tidak tersedia,
browser akan menggunakan font pengganti.
