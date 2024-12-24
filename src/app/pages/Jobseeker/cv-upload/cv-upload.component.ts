import { Component } from '@angular/core';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl,Validators } from '@angular/forms';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cv-upload.component.html',
  styleUrl: './cv-upload.component.css'
})
export class CvUploadComponent {
  cvForm: FormGroup;
  compressedImage: string | null = null;
  cvFile: File | null = null;

  constructor(private imageCompressionService: ImageCompressionService) {
    this.cvForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.required),
    });
  }

  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.imageCompressionService
        .compressImage(file, 1)
        .then((compressedImage) => {
          this.compressedImage = compressedImage;
          console.log('Compressed Image:', compressedImage);
        })
        .catch((error) => {
          console.error('Image Compression Error:', error);
        });
    }
  }

  onCvSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.cvFile = file;
    }
  }

  onSubmit(): void {
    if (this.cvForm.valid && this.cvFile && this.compressedImage) {
      const formData = new FormData();
      formData.append('name', this.cvForm.get('name')?.value);
      formData.append('email', this.cvForm.get('email')?.value);
      formData.append('phone', this.cvForm.get('phone')?.value);
      formData.append(
        'profileImage',
        this.dataURLToBlob(this.compressedImage),
        'compressed-image.jpg'
      );
      formData.append('cvFile', this.cvFile);

      console.log('Form Data Ready for Upload:', formData);
      // Call the API to upload the formData
    }
  }

  dataURLToBlob(dataUrl: string): Blob {
    const [header, body] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1];
    const binary = atob(body);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
  }
}

