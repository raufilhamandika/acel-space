# Website Ulang Tahun Acel

Website kecil ini dibuat sebagai hadiah ulang tahun untuk Acel. Isinya ada
halaman kode rahasia, ucapan pembuka, cerita kenangan, galeri foto, surat,
kartu wishes, dan penutup dengan lilin ulang tahun.

🌐 **Live Demo:** [raufilhamandika.github.io/acel-space](https://raufilhamandika.github.io/acel-space/)

🔑 **Kode Rahasia / Password:** `140826`

Website dibuat dengan HTML, CSS, dan JavaScript biasa. Tidak perlu memasang
aplikasi atau paket tambahan untuk mengeditnya.

---

## Cara membuka website

Cara paling sederhana: buka file `index.html` di browser.

Kalau ingin menjalankannya lewat server lokal, buka terminal di folder proyek,
lalu jalankan:

```powershell
py -m http.server 8000
```

Setelah itu buka <http://localhost:8000> di browser. Untuk menghentikan server,
kembali ke terminal dan tekan `Ctrl+C`.

## File penting

- `index.html` berisi tulisan, susunan halaman, dan nama file foto.
- `styles.css` mengatur warna, bentuk, ukuran, animasi, dan tampilan ponsel.
- `script.js` mengatur kode pembuka dan fitur yang bisa diklik.
- `assets/` berisi foto yang digunakan website.
- Gambar segel amplop surat ada di `assets/letter-seal.png`.

## Cara mengedit

### Mengganti tulisan

Buka `index.html`, lalu cari teks yang ingin diganti. Bagian-bagiannya
ditandai dengan komentar seperti `Halaman pembuka`, `Galeri foto`, dan
`Surat untuk Acel`. Ubah tulisannya tanpa menghapus tag HTML di sekelilingnya.
Isi surat ada di bagian `article` dengan `id="letter-card"` dan baru terlihat
setelah amplop diketuk.

### Mengganti foto

Simpan foto baru ke folder `assets/`, lalu ganti alamat foto di `index.html`.
Contohnya:

```html
src="assets/foto-baru.jpeg"
```

Di kartu galeri, alamat foto muncul dua kali: pada `data-image` dan pada
`src` gambar. Ganti keduanya agar foto di kartu dan foto saat diperbesar tetap
sama. Teks `alt` atau `data-photo-alt` juga sebaiknya disesuaikan agar
menjelaskan foto.
Untuk mengganti gambar segel amplop, ganti file `assets/letter-seal.png`.

### Mengubah tampilan

Buka `styles.css`. Cari komentar bagian yang ingin diubah, misalnya
`Warna dasar`, `Beranda`, atau `Galeri foto`. Untuk mengubah posisi potong
foto galeri, cari aturan `.gallery-one .gallery-photo` dan seterusnya.
Angka kedua pada `object-position` mengatur posisi atas-bawah foto:
angka lebih kecil menggeser fokus ke atas.
Tampilan 3D amplop dan ketebalan kartu surat diatur pada bagian `Kartu surat`.
Gerakan kartu saat digulir diatur melalui fungsi `setupScrollReveals` di
`script.js`; gerakan mengambang ilustrasi dan kilau diatur pada bagian animasi
di akhir `styles.css`.

### Mengubah kode pembuka

Buka `script.js`, lalu ganti nilai `SECRET_CODE` di bagian paling atas.
Kode ini hanya untuk kejutan: karena disimpan di JavaScript, kode tersebut
bukan pengaman untuk informasi pribadi.

## Catatan

Font website diambil dari Google Fonts. Jika internet tidak tersedia, browser
akan memakai font pengganti yang sudah disiapkan.
