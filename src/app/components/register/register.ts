import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/Auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  firstName = '';
  lastName  = '';
  email     = '';
  password  = '';
  phone     = '';
  address   = '';
  error     = '';
  loading   = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password || !this.firstName) return;
    console.log('Sending:', {
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      shippingAddress: this.address
    });
    this.loading = true;
    this.error   = '';

    this.auth.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      shippingAddress: this.address
    }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.error   = err?.error || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}