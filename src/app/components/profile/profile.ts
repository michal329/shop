import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/Auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  firstName = '';
  lastName  = '';
  email     = '';
  phone     = '';
  address   = '';
  editing   = false;
  success   = '';
  error     = '';
  loading   = false;

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.user      = this.auth.currentUserValue;
    this.firstName = this.user?.firstName       ?? '';
    this.lastName  = this.user?.lastName        ?? '';
    this.email     = this.user?.email           ?? '';
    this.phone     = this.user?.phone           ?? '';
    this.address   = this.user?.shippingAddress ?? '';
  }

  startEdit() {
    this.editing = true;
    this.success = '';
    this.error   = '';
  }

  cancelEdit() {
    this.editing   = false;
    this.firstName = this.user?.firstName       ?? '';
    this.lastName  = this.user?.lastName        ?? '';
    this.email     = this.user?.email           ?? '';
    this.phone     = this.user?.phone           ?? '';
    this.address   = this.user?.shippingAddress ?? '';
  }

  saveChanges() {
    if (!this.user) return;
    this.loading = true;
    this.error   = '';
    this.success = '';

    this.auth.updateProfile(this.user.id, {
      firstName: this.firstName,
      lastName:  this.lastName,
      email:     this.email,
      phone:     this.phone,
      address:   this.address
    }).subscribe({
      next: () => {
        this.user    = this.auth.currentUserValue;
        this.editing = false;
        this.success = 'Profile updated successfully!';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error   = 'Failed to update profile. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}