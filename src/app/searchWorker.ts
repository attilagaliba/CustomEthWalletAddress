import { ethers } from 'ethers';

let shouldStop = false;

self.onmessage = (e) => {
  const { type, prefix, suffix, isChecksum } = e.data;
  
  if (type === 'start') {
    shouldStop = false;
    searchWallet(prefix, suffix, isChecksum);
  } else if (type === 'stop') {
    shouldStop = true;
  }
};

const searchWallet = (prefix: string, suffix: string, isChecksum: boolean) => {
  let attempts = 0;
  const startTime = Date.now();

  while (!shouldStop) {
    try {
      const randomWallet = ethers.Wallet.createRandom();
      const address = randomWallet.address;
      const addressWithoutPrefix = address.slice(2).toLowerCase();
      
      // Her denemede progress bildirimi gönder
      self.postMessage({
        type: 'progress',
        wallet: {
          address,
          privateKey: randomWallet.privateKey,
        },
        attempts: ++attempts,
        speed: Math.floor(attempts / ((Date.now() - startTime) / 1000))
      });

      // Eşleşme kontrolü
      if (
        addressWithoutPrefix.startsWith(prefix.toLowerCase()) &&
        addressWithoutPrefix.endsWith(suffix.toLowerCase())
      ) {
        // Checksum kontrolü
        const checksumValid = !isChecksum || (
          prefix === '' || address.slice(2, 2 + prefix.length) === prefix
        ) && (
          suffix === '' || address.slice(-suffix.length) === suffix
        );

        if (checksumValid) {
          self.postMessage({
            type: 'found',
            wallet: {
              address,
              privateKey: randomWallet.privateKey,
            }
          });
          return;
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }
}; 