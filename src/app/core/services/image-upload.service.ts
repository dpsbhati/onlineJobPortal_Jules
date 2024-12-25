import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private readonly allowedImageFormats = ['jpeg', 'png', 'webp'];

  constructor() {}

  /**
   * Handle image selection and validate the image file based on size and format.
   * @param event - The file input event.
   * @param maxSizeMB - Maximum allowed size in MB
   * @returns - The validated image file.
   * @throws - Error if the file is invalid.
   */
  validateImage(event: Event, maxSizeMB: number = 5): File {
    const input = event.target as HTMLInputElement;

    
    if (!input.files || input.files.length === 0) {
      throw new Error('No file selected.');
      
    }

    const file = input.files[0];

    // Check file format
    if (!this.allowedImageFormats.includes(file.type)) {
      throw new Error('Invalid file format. Only JPEG, PNG, and WebP formats are allowed.');
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to Bytes
    if (file.size > maxSizeBytes) {
      throw new Error(`File size exceeds the allowed limit of ${maxSizeMB}MB.`);
    }

    return file; // Return the validated file
  }
}
