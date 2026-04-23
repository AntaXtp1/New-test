# Music Stream - Web Music Player (Spotify x YT Music Style)

Aplikasi web music player dengan layout dan fitur mirip Spotify/YT Music, dibangun menggunakan Python Flask.

## ✨ Fitur

- **Layout Modern**: Sidebar + Main Content + Player Bar di bawah dengan full grid layout
- **Home Page**: Featured banner besar dengan overlay gradient, grid 6 album trending, list track recent releases
- **Discover Page**: Search bar + genre grid cards dengan hover effect
- **Library Page**: Menampilkan track yang di-like
- **Player Bar Lengkap**: 
  - Play/pause, next/prev controls
  - Progress bar clickable
  - Volume slider
  - Shuffle & repeat toggle
  - Cover pulse animation saat playing
- **Interaksi**: 
  - Klik album/track untuk play
  - Heart icon muncul saat hover track
  - Active track highlight dengan warna electric lime (#C8FF3E)

## 🚀 Deploy ke Vercel

1. Pastikan Anda memiliki akun Vercel dan Vercel CLI terinstall:
   ```bash
   npm i -g vercel
   ```

2. Login ke Vercel:
   ```bash
   vercel login
   ```

3. Deploy aplikasi:
   ```bash
   vercel --prod
   ```

4. Atau gunakan dashboard Vercel:
   - Push kode ke GitHub/GitLab
   - Import project di Vercel dashboard
   - Pilih repository dan deploy

## 🛠️ Local Development

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Server
```bash
python app.py
```

Aplikasi akan berjalan di `http://localhost:5000`

## 📁 Struktur Project

```
/workspace
├── app.py                 # Flask backend API
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel configuration
└── app/
    ├── templates/
    │   └── index.html    # Main HTML template
    └── static/
        ├── css/
        │   └── style.css # Stylesheet
        └── js/
            └── app.js    # Frontend JavaScript
```

## 🎨 Warna Accent

- Electric Lime: `#C8FF3E` (warna accent utama)
- Dark Background: `#0a0a0a`, `#121212`, `#1a1a1a`

## 🔄 Scraping Integration

Saat ini menggunakan mock data. Untuk integrasi scraping nyata:

1. Tambahkan scraper module di folder `app/scraper/`
2. Update endpoint API di `app.py` untuk memanggil scraper
3. Gunakan library seperti `requests` + `BeautifulSoup` atau `selenium`

Contoh scraper placeholder sudah tersedia di `app.py`.

## 📝 Catatan

- Aplikasi ini adalah demo dengan mock data
- Untuk production, integrasikan dengan API musik asli (Spotify API, YouTube Music API, dll)
- Progress bar dan audio playback adalah simulasi UI
