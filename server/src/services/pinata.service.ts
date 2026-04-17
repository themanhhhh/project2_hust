// Pinata configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY || '5b9afb41a6a64bcad1f7';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || '080a3e13f1c8a9527e3ff8faaeb9871b5df53900099d88edba2259f98be701ec';
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export class PinataService {
  /**
   * Upload a file buffer to Pinata IPFS
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    // Create a Blob from the buffer
    const blob = new Blob([fileBuffer], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata upload error:', error);
      throw new Error('Failed to upload to Pinata');
    }

    const data = await response.json() as PinataResponse;
    const imageUrl = `${PINATA_GATEWAY}/${data.IpfsHash}`;
    
    console.log('Image successfully uploaded to Pinata:', imageUrl);
    return imageUrl;
  }

  /**
   * Unpin a file from Pinata by CID
   */
  async unpinFile(cid: string): Promise<void> {
    const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      method: 'DELETE',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata unpin error:', error);
      throw new Error('Failed to unpin from Pinata');
    }
  }

  /**
   * Get public URL from CID
   */
  getPublicUrl(cid: string): string {
    return `${PINATA_GATEWAY}/${cid}`;
  }

  /**
   * Extract CID from Pinata URL
   */
  extractCid(url: string): string | null {
    const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
}
