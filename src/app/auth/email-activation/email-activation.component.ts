import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-email-activation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './email-activation.component.html',
  styleUrl: './email-activation.component.css'
})
export class EmailActivationComponent {
  token: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the token from the URL
  
    this.activatedRoute.queryParams.subscribe(params => {
      // console.log('Query Params:', params); 
      this.token = params['token']; 
      if (this.token) {
        this.verifyEmail(this.token);
      } else {
        this.errorMessage = 'Invalid token.';
      }
    });
  }

  verifyEmail(token: string): void {
    this.authService.verifyEmail({ token }).subscribe(
      (response: any) => {
      
        if (response.statusCode === 200) {

          this.successMessage = 'Email verified successfully!';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Email verification failed. Please try again.';
        //   setTimeout(() => {
        //     this.router.navigate(['/auth/login']);
        //   }, 2000);
        // }
      }
    },

    );
  }
}
