# Ethereum Custom Address Generator

[![Demo](https://img.shields.io/badge/Demo-Live%20Preview-blue)](https://custom-eth-wallet-address.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-green)](https://github.com/attilagaliba/CustomEthWalletAddress.git)

Modern ve güvenli bir Ethereum özel adres üretici. İstediğiniz prefix ve suffix'e sahip Ethereum adresleri oluşturun.

![Preview](https://i.ibb.co/Vp9WvpQC/image.png)

## 🚀 Özellikler

- ⚡ Yüksek performanslı Web Worker implementasyonu
- 🔒 Tamamen client-side işlem (private key'ler asla sunucuya gönderilmez)
- 🎨 Modern ve responsive tasarım
- 🖼️ Dinamik NFT/Artwork galerisi
- 📊 Gerçek zamanlı istatistikler ve izleme
- ✨ Framer Motion animasyonları
- 🌈 Özelleştirilebilir prefix ve suffix
- ✅ Checksum desteği

## 🛠️ Teknolojiler

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Web Workers
- Vercel Blob Storage (Artwork hosting)

## 📁 Dosya Yapısı

```
src/
├── app/
│   ├── page.tsx           # Ana uygulama sayfası
│   ├── searchWorker.ts    # Web Worker implementasyonu
│   ├── images.json        # Artwork konfigürasyonu
│   ├── info.json         # Uygulama bilgileri
│   └── layout.tsx        # Layout komponenti
├── styles/
│   └── globals.css       # Global stiller
└── public/
    └── assets/          # Statik dosyalar
```

## ⚙️ Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/attilagaliba/CustomEthWalletAddress.git
cd CustomEthWalletAddress
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
```

4. Tarayıcınızda açın: `http://localhost:3000`

## 🔧 Konfigürasyon

### images.json

Artwork galerisi için konfigürasyon dosyası. Her artwork için aşağıdaki alanları içermelidir:

```json
{
  "image": "artwork_url",
  "artist": "sanatçı_adı",
  "artName": "eser_adı",
  "artLink": "eser_linki",
  "file": "video" | "image"
}
```

- `image`: Artwork URL'i (görsel veya video)
- `artist`: Sanatçı adı
- `artName`: Eser adı
- `artLink`: Eserin orijinal linki
- `file`: Dosya tipi ("video" veya "image")

### info.json

Uygulama bilgileri ve bağlantıları için konfigürasyon dosyası:

```json
{
  "supAddress": "donation_address",
  "arworkSubmissionLink": "artwork_submission_url",
  "gitLink": "github_repo_url",
  "footerText": "footer_text",
  "creatorName": "creator_name",
  "creatorLink": "creator_website"
}
```

## 🎨 Özelleştirme

### Artwork Değişim Süresi

`page.tsx` içinde `ARTWORK_CHANGE_INTERVAL` değerini değiştirerek artwork değişim süresini ayarlayabilirsiniz (milisaniye cinsinden).

```typescript
const ARTWORK_CHANGE_INTERVAL = 8000; // 8 saniye
```

### Tema ve Renkler

Tailwind CSS konfigürasyonunu `tailwind.config.js` dosyasında özelleştirebilirsiniz.

## 🔒 Güvenlik

- Tüm işlemler tarayıcınızda yerel olarak gerçekleştirilir
- Private key'ler asla sunucuya gönderilmez veya saklanmaz
- Web Worker kullanılarak ana thread bloklanmaz

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

MIT License - daha fazla detay için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- NFT sanatçılarına artwork'leri için
- Ethereum topluluğuna
- Tüm katkıda bulunanlara

## 🔗 Faydalı Linkler

- [Demo](https://custom-eth-wallet-address.vercel.app)
- [GitHub Repo](https://github.com/attilagaliba/CustomEthWalletAddress.git)
- [Artwork Submission](https://x.com/attilagaliba/status/1902466607370162255)
- [Creator Website](https://gikklab.com)
