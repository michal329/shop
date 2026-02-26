import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/User`;

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private currentUserSignal = signal<User | null>(null);
  public readonly isLoggedInSignal = computed(() => this.currentUserSignal() !== null);
  public readonly isAdminSignal    = computed(() => this.currentUserSignal()?.isAdmin ?? false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    let user: User | null = null;
    if (isPlatformBrowser(this.platformId)) {
      try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch {}
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
    this.currentUserSignal.set(user);
  }

  get currentUserValue(): User | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean           { return this.currentUserSignal() !== null; }
  get isAdmin(): boolean              { return this.currentUserSignal()?.isAdmin ?? false; }

  // POST /api/User/Login  → returns UserDTO
  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/Login`, { email, password }).pipe(
      tap(user => {
        // API returns UserId (capital), map to id for our model
        const mapped: User = { ...user, id: Number((user as any).userId ?? (user as any).id) };
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(mapped));
        }
        this.currentUserSubject.next(mapped);
        this.currentUserSignal.set(mapped);
      })
    );
  }

  // POST /api/User  → register new user
  register(userData: Partial<User> & { password: string }): Observable<User> {
    const payload = {
      email:     userData.email,
      firstName: userData.firstName,
      lastName:  userData.lastName,
      password:  userData.password,
      phone:     userData.phone     || '',
      address:   userData.shippingAddress || '',
      isAdmin:   false
    };
    return this.http.post<User>(this.apiUrl, payload);
  }

  // PUT /api/User/{id}  → update profile
  updateProfile(id: number, updates: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string }): Observable<void> {
    const current = this.currentUserValue!;
    const payload = {
      email:     updates.email     ?? current.email,
      firstName: updates.firstName ?? current.firstName,
      lastName:  updates.lastName  ?? current.lastName,
      password:  current.password || '',
      phone:     updates.phone     ?? current.phone     ?? '',
      address:   updates.address   ?? current.shippingAddress ?? '',
      isAdmin:   current.isAdmin   ?? false
    };
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => {
        const updated: User = {
          ...current,
          firstName: updates.firstName ?? current.firstName,
          lastName: updates.lastName ?? current.lastName,
          email: updates.email ?? current.email,
          phone: updates.phone ?? current.phone,
          shippingAddress: updates.address ?? current.shippingAddress
        };
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(updated));
        }
        this.currentUserSubject.next(updated);
        this.currentUserSignal.set(updated);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
  }
}