import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  // Categories are intentionally duplicated here for simplicity.
  // Keep in sync with `navbar` category ids if your API expects specific ids.
  categories = [
    { id: 1, name: 'Living Room', icon: '🛋️' },
    { id: 2, name: 'Kitchen', icon: '🍳' },
    { id: 3, name: 'Bedroom', icon: '🛏️' },
    { id: 4, name: 'Storage', icon: '🗄️' },
    { id: 5, name: 'Lighting', icon: '💡' },
    { id: 6, name: 'Textiles', icon: '🧺' }
  ];
}
