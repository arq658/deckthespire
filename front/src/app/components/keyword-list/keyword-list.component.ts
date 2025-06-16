import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Keyword } from '../../models/keyword.model';

@Component({
  selector: 'app-keyword-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyword-list.component.html',
  styleUrls: ['./keyword-list.component.scss']
})
export class KeywordListComponent implements OnInit {
  keywords: Keyword[] = [];
  filteredKeywords: Keyword[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.getAllKeywords().subscribe({
      next: (data) => {
        this.keywords = data;
        // Filtrar para mostrar todas menos las 5 primeras
        this.filteredKeywords = this.keywords.slice(5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching keywords', error);
        this.error = 'Failed to load keywords. Please try again later.';
        this.loading = false;
      }
    });
  }
}
