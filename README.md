# [Live Demo](https://custom-eth-wallet-address.vercel.app)

<div align="center">
   Ethereum Custom Address Generator
 
   ![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
   ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
   ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC)
   ![Framer Motion](https://img.shields.io/badge/Framer_Motion-10.16.4-ff69b4)
   ![Web Workers](https://img.shields.io/badge/Web_Workers-Enabled-green)
</div>

[![GitHub](https://img.shields.io/badge/GitHub-Repository-green)](https://github.com/attilagaliba/CustomEthWalletAddress.git)

A modern and secure Ethereum custom address generator. Create Ethereum addresses with your desired prefix and suffix.

![Preview](https://i.ibb.co/tTXqwqns/image.png)

## 🚀 Features

- ⚡ High-performance Web Worker implementation
- 🔒 Fully client-side processing (private keys never leave your browser)
- 🎨 Modern and responsive design
- 🖼️ Dynamic NFT/Artwork gallery
- 📊 Real-time statistics and monitoring
- ✨ Framer Motion animations
- 🌈 Customizable prefix and suffix
- ✅ Checksum support

## 🛠️ Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Web Workers
- Vercel Blob Storage (Artwork hosting)

## 📁 File Structure

```
src/
├── app/
│   ├── page.tsx           # Main application page
│   ├── searchWorker.ts    # Web Worker implementation
│   ├── images.json        # Artwork configuration
│   ├── info.json         # Application information
│   └── layout.tsx        # Layout component
├── styles/
│   └── globals.css       # Global styles
└── public/
    └── assets/          # Static files
```

## ⚙️ Installation

1. Clone the repository:
```bash
git clone https://github.com/attilagaliba/CustomEthWalletAddress.git
cd CustomEthWalletAddress
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open in your browser: `http://localhost:3000`

## 🔧 Configuration

### images.json

Configuration file for the artwork gallery. Each artwork should include the following fields:

```json
{
  "image": "artwork_url",
  "artist": "artist_name",
  "artName": "artwork_name",
  "artLink": "artwork_link",
  "file": "video | image"
}
```

- `image`: Artwork URL (image or video)
- `artist`: Artist name
- `artName`: Artwork name
- `artLink`: Original artwork link
- `file`: File type ("video" or "image")

### info.json

Configuration file for application information and links:

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

## 🎨 Customization

### Artwork Change Interval

You can adjust the artwork change interval (in milliseconds) by modifying `ARTWORK_CHANGE_INTERVAL` in `page.tsx`:

```typescript
const ARTWORK_CHANGE_INTERVAL = 8000; // 8 seconds
```

### Theme and Colors

Customize the Tailwind CSS configuration in `tailwind.config.js`.

## 🔒 Security

- All operations are performed locally in your browser
- Private keys are never transmitted or stored on any server
- Web Worker implementation prevents main thread blocking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NFT artists for their artwork contributions
- Ethereum community
- All contributors

## 🔗 Useful Links

- [Live Demo](https://custom-eth-wallet-address.vercel.app)
- [GitHub Repository](https://github.com/attilagaliba/CustomEthWalletAddress.git)
- [Artwork Submission](https://x.com/attilagaliba/status/1902466607370162255)
- [Creator Website](https://gikklab.com)
