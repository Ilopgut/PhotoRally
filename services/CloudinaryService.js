// services/CloudinaryService.js

class CloudinaryService {
  constructor() {
    this.cloudName = 'dcaktlgn3'; // Sustituye temporalmente la variable
//    this.cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }

  async uploadImage(imageUri, userId) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `${userId}_${timestamp}`;

      // Crear FormData para la subida
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      // Usar el upload preset que configuraste
      formData.append('upload_preset', 'profile_pics_preset');
//      formData.append('public_id', publicId); CLOUDINARY GENERA EL PUBLICID AUTOMATICAMENTE

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${errorData}`);
      }

      const result = await response.json();
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generar URL optimizada para mostrar
  getOptimizedUrl(url, width = 300, height = 300) {
    if (!url) return null;

    // Si ya es una URL de Cloudinary, aplicar transformaciones
    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_fill,w_${width},h_${height},q_auto,f_auto/${parts[1]}`;
      }
    }

    return url;
  }

  // Extraer public_id de una URL de Cloudinary
  getPublicIdFromUrl(url) {
    if (!url || !url.includes('cloudinary.com')) return null;

    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && parts[uploadIndex + 2]) {
        // Remover extensión del archivo
        const publicId = parts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, "");
        return publicId;
      }
    } catch (error) {
      console.error('Error extracting public_id:', error);
    }

    return null;
  }
}

export default new CloudinaryService();