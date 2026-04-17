// Pinata upload utilities for client-side
const PINATA_API_KEY = '5b9afb41a6a64bcad1f7';
const PINATA_SECRET_API_KEY = '080a3e13f1c8a9527e3ff8faaeb9871b5df53900099d88edba2259f98be701ec';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Upload a file directly to Pinata from client
 */
export async function uploadFileToPinata(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      body: formData,
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload to Pinata');
    }

    const data = await response.json();
    const imageUrl = `${PINATA_GATEWAY}/${data.IpfsHash}`;
    console.log('Image successfully uploaded to Pinata:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw new Error('Unable to upload image to Pinata');
  }
}

/**
 * Upload image via server API (recommended for production)
 */
export async function uploadImageViaServer(
  file: File,
  productId?: string
): Promise<string> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const formData = new FormData();
  formData.append('image', file);

  const endpoint = productId 
    ? `${API_BASE_URL}/upload/product/${productId}/image`
    : `${API_BASE_URL}/upload/image`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.data.url || data.data.image_url;
}

/**
 * Get image URL with fallback to placeholder
 */
export function getImageUrl(url?: string | null, fallback: string = '/products/placeholder.jpg'): string {
  if (!url) return fallback;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  return `${PINATA_GATEWAY}/${url}`;
}
