'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import images from './images.json';
import info from './info.json';
import Image from 'next/image';

// Artwork tipi için interface
interface Artwork {
  image: string;
  artist: string;
  artName: string;
  artLink: string;
  file: "video" | "image";
  fadeOut?: boolean;
}

// Artwork array'ini tanımla
const artworks = images as Artwork[];

interface SearchOptions {
  prefix: string;
  suffix: string;
  isChecksum: boolean;
}

interface SearchStats {
  difficulty: number;
  probability50: number;
  estimatedTime: string;
  isValid: boolean;
  example: string | null;
  attempts: number;
  speed: number;
}

interface WalletAttempt {
  address: string;
  privateKey: string;
  timestamp: number;
  id: string;
}

interface Wallet {
  address: string;
  privateKey: string;
  seed: string;
  difficulty: number;
}

// Artwork değişim süresi için constant
const ARTWORK_CHANGE_INTERVAL = 8000; // 8 saniye

// Rastgele hex karakteri üretme fonksiyonu
const generateRandomHex = (length: number): string => {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

export default function Home() {
  const [options, setOptions] = useState<SearchOptions>({
    prefix: '',
    suffix: '',
    isChecksum: true
  });

  const [stats, setStats] = useState<SearchStats>({
    attempts: 0,
    speed: 0,
    difficulty: 1,
    probability50: 0,
    estimatedTime: '0 s',
    isValid: true,
    example: '0x0000000000000000000000000000000000000000'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [currentImage, setCurrentImage] = useState(artworks[0]);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);

  const [randomAddress, setRandomAddress] = useState('0'.repeat(40));
  const [randomPrivateKey, setRandomPrivateKey] = useState('0'.repeat(64));

  const [defaultAddress, setDefaultAddress] = useState('');
  const [defaultPrivateKey, setDefaultPrivateKey] = useState('');

  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2 saniye sonra geri döner
    } catch (err) {
      console.error('Kopyalama başarısız oldu:', err);
    }
  };

  useEffect(() => {
    // Rastgele artwork seçimi için useEffect
    const getRandomArtwork = () => {
      const currentIndex = artworks.findIndex(art => art.image === currentImage.image);
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * artworks.length);
      } while (newIndex === currentIndex && artworks.length > 1);
      return artworks[newIndex];
    };

    const changeArtwork = () => {
      const newArtwork = getRandomArtwork();
      setCurrentImage(prevImage => ({
        ...newArtwork,
        fadeOut: true
      }));

      setTimeout(() => {
        setCurrentImage(newArtwork);
      }, 500);
    };

    const interval = setInterval(changeArtwork, ARTWORK_CHANGE_INTERVAL);
    return () => clearInterval(interval);
  }, [currentImage]);

  // Rastgele adres ve private key üretimi için interval
  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setRandomAddress(generateRandomHex(40));
        setRandomPrivateKey(generateRandomHex(64));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const isValidHex = (hex: string): boolean => {
    return hex.length ? /^[0-9A-F]+$/g.test(hex.toUpperCase()) : true;
  };

  const mixCase = (str: string): string => {
    return str.split('').map(char =>
      Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase()
    ).join('');
  };

  const generateExample = (prefix: string, suffix: string, isChecksum: boolean): string | null => {
    if (!isValidHex(prefix) || !isValidHex(suffix)) {
      return null;
    }

    const prefixPart = isChecksum ? prefix : mixCase(prefix);
    const suffixPart = isChecksum ? suffix : mixCase(suffix);
    const randomLength = 40 - prefix.length - suffix.length;

    if (randomLength < 0) return null;

    const randomPart = Array.from({ length: randomLength }, () =>
      mixCase(Math.floor(Math.random() * 16).toString(16))
    ).join('');

    return `0x${prefixPart}${randomPart}${suffixPart}`;
  };

  const validateInput = (input: string, type: 'prefix' | 'suffix'): string => {
    // Hex karakterleri dışındakileri temizle
    const cleaned = input.replace(/[^0-9A-Fa-f]/g, '');

    // Maksimum uzunluk kontrolü
    const maxLength = type === 'prefix' ? 38 : 40 - options.prefix.length;
    return cleaned.slice(0, maxLength);
  };

  const handleInputChange = (value: string, type: 'prefix' | 'suffix') => {
    const validatedInput = validateInput(value, type);
    setOptions(prev => ({
      ...prev,
      [type]: validatedInput
    }));
  };

  const calculateStats = (): SearchStats => {
    const prefixValid = isValidHex(options.prefix);
    const suffixValid = isValidHex(options.suffix);
    const totalLength = options.prefix.length + options.suffix.length;

    if (!prefixValid || !suffixValid || totalLength > 38) {
      return {
        difficulty: 0,
        probability50: 0,
        estimatedTime: 'Geçersiz Giriş',
        isValid: false,
        example: null,
        attempts: 0,
        speed: 0
      };
    }

    const pattern = options.prefix + options.suffix;
    let difficulty = Math.pow(16, pattern.length);

    if (options.isChecksum) {
      const letterCount = pattern.replace(/[^a-fA-F]/g, '').length;
      difficulty *= Math.pow(2, letterCount);
    }

    const probability50 = Math.floor(Math.log(0.5) / Math.log(1 - 1 / difficulty));

    // Hıza göre süre tahmini (varsayılan hız: 1000 addr/s)
    const speed = stats.speed || 1000;
    const estimatedSeconds = probability50 / speed;

    return {
      difficulty,
      probability50,
      estimatedTime: formatDuration(estimatedSeconds),
      isValid: true,
      example: generateExample(options.prefix, options.suffix, options.isChecksum),
      attempts: 0,
      speed: speed
    };
  };

  const formatDuration = (seconds: number): string => {
    if (seconds > 200 * 365.25 * 24 * 3600) return 'damn yeaarrss';
    if (seconds > 365.25 * 24 * 3600) return `${Math.round(seconds / (365.25 * 24 * 3600))} y`;
    if (seconds > 24 * 3600) return `${Math.round(seconds / (24 * 3600))} d`;
    if (seconds > 3600) return `${Math.round(seconds / 3600)} h`;
    if (seconds > 60) return `${Math.round(seconds / 60)} s`;
    return `${Math.round(seconds)} s`;
  };

  useEffect(() => {
    const isValidInput = isValidHex(options.prefix) && isValidHex(options.suffix);
    if (!isValidInput) {
      setStats({
        difficulty: 0,
        probability50: 0,
        estimatedTime: '',
        isValid: false,
        example: null,
        attempts: 0,
        speed: 0
      });
      return;
    }

    const difficulty = calculateStats().difficulty;
    const probability50 = Math.floor(Math.log(0.5) / Math.log(1 - 1 / difficulty));
    const estimatedTime = formatDuration(probability50 / 1000); // Assuming 1000 addresses per second

    setStats({
      difficulty,
      probability50,
      estimatedTime,
      isValid: true,
      example: calculateStats().example,
      attempts: 0,
      speed: 0
    });
  }, [options]);

  const handleWorkerMessage = (e: MessageEvent) => {
    if (e.data.type === 'result') {
      setWallet(e.data.wallet);
      setIsSearching(false);
    } else if (e.data.type === 'progress') {
      setStats(prev => ({
        ...prev,
        attempts: prev.attempts + e.data.attempts,
        speed: e.data.speed
      }));
    }
  };

  const stopSearch = () => {
    if (worker) {
      worker.terminate();
      setWorker(null);
    }
    setIsSearching(false);
  };

  const startSearch = () => {
    setStats(prev => ({
      ...prev,
      attempts: 0,
      speed: 0
    }));
    setWallet(null);
    setupWorker();
    setIsSearching(true);
  };

  // Worker setup fonksiyonu
  const setupWorker = () => {
    const searchWorker = new Worker(new URL('./searchWorker.ts', import.meta.url));
    searchWorker.onmessage = handleWorkerMessage;
    setWorker(searchWorker);
  };

  const formatElapsedTime = (startTime: number): string => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    calculateStats();
  }, [options]);

  const handleImageChange = (prevImage: Artwork) => {
    // ... existing code ...
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-xl text-white text-[75%]">
      {/* Footer - Sağ üstte */}
      <motion.div
        className="fixed top-4 right-4 bg-black/20 backdrop-blur-md rounded-lg px-4 py-2 z-50 text-[150%]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
      >
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, delay: 0.7 }}
          className="text-gray-300 flex items-center gap-2"
        >
          {info[0].footerText}{' '}
          <a 
            href={info[0].creatorLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-200 hover:text-purple-300 transition-colors"
          >
            {info[0].creatorName}
          </a>
        </motion.p>
      </motion.div>

      <div className="flex-1 flex">
        <div className="w-1/2 p-8 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-xl mx-auto flex-1 flex flex-col"
          >
            <motion.h1
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                initial={{ rotate: -180 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </motion.svg>
              Ethereum Custom Address Generator
            </motion.h1>

            <div className="bg-gray-800/30 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-gray-700/50 flex-1 flex flex-col max-h-[100%]">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xl text-gray-300 mb-1">
                      Prefix
                      <span className="text-gray-500 text-xs ml-2">
                        {`Max ${38 - options.suffix.length} chars`}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">0x</span>
                      <input
                        type="text"
                        value={options.prefix}
                        onChange={(e) => handleInputChange(e.target.value, 'prefix')}
                        className={`w-full bg-gray-700/50 rounded-lg pl-8 pr-3 py-3 text-white ${!isValidHex(options.prefix) ? 'border-red-500' : 'border-gray-600/50'
                          }`}
                        placeholder="dead"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xl text-gray-300 mb-1">
                      Suffix
                      <span className="text-gray-500 text-xs ml-2">
                        {`Max ${38 - options.prefix.length} chars`}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={options.suffix}
                      onChange={(e) => handleInputChange(e.target.value, 'suffix')}
                      className={`w-full bg-gray-700/50 rounded-lg px-3 py-3 text-white ${!isValidHex(options.suffix) ? 'border-red-500' : 'border-gray-600/50'
                        }`}
                      placeholder="beef"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="checksum"
                    checked={options.isChecksum}
                    onChange={(e) => setOptions({ ...options, isChecksum: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700/50 border-gray-600/50 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="checksum" className="text-gray-300">
                    Consider checksum
                  </label>
                </div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-2 gap-3 bg-gray-700/20 rounded-lg p-4"
                >
                  <div>
                    <div className="text-gray-400">Difficulty</div>
                    <div className="font-semibold">{stats.difficulty.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">probability</div>
                    <div className="font-semibold">{stats.estimatedTime}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Speed</div>
                    <div className="font-semibold">{stats.speed.toLocaleString()} addr/s</div>
                  </div>
                  {searchStartTime && isSearching && (
                    <div>
                      <div className="text-gray-400">Elapsed Time</div>
                      <div className="font-semibold">{formatElapsedTime(searchStartTime)}</div>
                    </div>
                  )}
                </motion.div>

                <div className="p-4 bg-gray-700/20 rounded-lg">
                  <div className="text-gray-400 mb-2">Example Address:</div>
                  <div className="font-mono break-all">
                    0x
                    <span className="text-blue-400">{options.prefix}</span>
                    {stats.example ? stats.example.slice(2 + options.prefix.length, -options.suffix.length) : '0'.repeat(40 - options.prefix.length - options.suffix.length)}
                    <span className="text-blue-400">{options.suffix}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={startSearch}
                    disabled={!stats?.isValid || isSearching}
                    className={`
                      flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                      ${stats?.isValid && !isSearching
                        ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/80 hover:to-blue-500/80'
                        : 'bg-gray-700/50 cursor-not-allowed'
                      }
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {isSearching ? 'Searching...' : 'Generate Wallet'}
                  </button>

                  <div className="flex gap-3">
                    {isSearching && (
                      <button
                        onClick={stopSearch}
                        className="px-6 py-3 rounded-lg font-medium bg-red-600/80 hover:bg-red-500/80 transition-all flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Stop
                      </button>
                    )}
                    
                    <button
                      onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                      className="px-6 py-3 rounded-lg font-medium bg-purple-600/80 hover:bg-purple-500/80 transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Info
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-700/20 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Attempts: {stats.attempts.toLocaleString()}</span>
                    <span>Speed: {stats.speed.toLocaleString()} addr/s</span>
                  </div>
                  <div className="h-2 bg-gray-600/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600/80 to-blue-600/80"
                      style={{
                        width: isSearching ? `${Math.min(100, (stats.attempts / stats.probability50) * 100)}%` : '0%'
                      }}
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-500/20">
                    <h3 className="font-semibold mb-3 text-purple-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {wallet ? 'Generated Wallet' : 'Wallet Preview'}
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Wallet Address</label>
                        <motion.div
                          className="font-mono bg-black/20 p-3 rounded-lg break-all"
                          key={wallet ? wallet.address : randomAddress}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {wallet ? wallet.address : '0x' + randomAddress}
                        </motion.div>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1 flex items-center gap-2">
                          Private Key
                          <span className="text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </span>
                        </label>
                        <motion.div
                          className="font-mono bg-black/20 p-3 rounded-lg break-all"
                          key={wallet ? wallet.privateKey : randomPrivateKey}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {wallet ? wallet.privateKey : '0x' + randomPrivateKey}
                        </motion.div>
                      </div>

                      <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-300 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Keep this private key safe. If you lose it, you'll lose access to your wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sağ taraf - Görsel/Video */}
        <div className="w-1/2 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: currentImage.fadeOut ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {currentImage.file === 'image' ? (
              <Image 
                src={currentImage.image} 
                alt={currentImage.artName}
                width={500}
                height={300}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                key={currentImage.image}
                src={currentImage.image}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            )}

            <motion.div
              className="absolute bottom-8 right-8 z-10 text-[150%]"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <a
                href={currentImage.artLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-black/30 backdrop-blur-md rounded-lg p-3 text-white hover:bg-black/40 transition-colors"
              >
                <h2 className="font-bold">{currentImage.artName}</h2>
                <p className="opacity-80">by {currentImage.artist}</p>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Info Panel - Sol tarafta */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: isInfoPanelOpen ? 0 : '-100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-purple-900/90 to-black/90 backdrop-blur-xl p-6 shadow-2xl z-50 overflow-y-auto border-r border-purple-500/20"
        >
          <button
            onClick={() => setIsInfoPanelOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">About This Project</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
            </div>

            <section>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Features</h3>
              <ul className="list-none space-y-3 text-gray-300">
                {['Generate custom Ethereum addresses', 'Client-side generation for security', 'High-performance Web Worker implementation', 'Real-time statistics and monitoring'].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Security</h3>
              <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-4">
                <p className="text-gray-300">
                  All operations are performed locally in your browser. No private keys are ever transmitted or stored.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Open Source</h3>
              <div className="space-y-3">
                <p className="text-gray-300">
                  This project is open source and available on GitHub. Contributions are welcome!
                </p>
                <a
                  href={info[0].gitLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>View on GitHub</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Support</h3>
              <div className="space-y-3">
                <p className="text-gray-300">
                  If you find this tool useful, consider supporting the development:
                </p>
                <motion.div 
                  onClick={() => copyToClipboard(info[0].supAddress)}
                  className="bg-black/30 p-4 rounded-xl border border-purple-500/20 font-mono text-sm break-all hover:bg-black/40 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Donation Address</span>
                    <motion.span 
                      className="text-xs text-purple-400 group-hover:text-purple-300"
                      animate={{ opacity: 1 }}
                      initial={{ opacity: 0 }}
                      key={isCopied ? 'copied' : 'copy'}
                    >
                      {isCopied ? 'Copied!' : 'Click to Copy'}
                    </motion.span>
                  </div>
                  {info[0].supAddress}
                </motion.div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Artwork Gallery</h3>
              <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-4 space-y-3">
                <p className="text-gray-300">
                  Want your artwork featured in our gallery? Submit your work and become part of our Web3 art collection.
                </p>
                <a
                  href={info[0].arworkSubmissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <span>Submit Artwork</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 