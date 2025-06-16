import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Relic } from '../../models/relic.model';

@Component({
  selector: 'app-relic-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relic-list.component.html',
  styleUrls: ['./relic-list.component.scss']
})
export class RelicListComponent implements OnInit {
  relics: Relic[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.getAllRelics().subscribe({
      next: (data) => {
        this.relics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching relics', error);
        this.error = 'Failed to load relics. Please try again later.';
        this.loading = false;
      }
    });
  }
}
