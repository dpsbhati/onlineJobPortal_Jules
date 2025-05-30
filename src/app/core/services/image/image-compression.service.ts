import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  constructor() {}

  async compressImage(file: File, maxSizeMB: number = 1): Promise<string> {
    const options = {
      maxSizeMB,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      console.log(compressedFile,'compressedImage');
      return imageCompression.getDataUrlFromFile(compressedFile);
    } catch (error) {
      console.error('Image compression error:', error);
      throw error;
    }
  }
}
