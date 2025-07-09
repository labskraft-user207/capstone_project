import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonserviceService } from '../commonservice.service';

@Component({
  selector: 'app-pointshistory',
  templateUrl: './pointshistory.component.html',
  imports: [CommonModule, HttpClientModule, FormsModule],
  styleUrl: './pointshistory.component.css',
  standalone: true
})
export class PointshistoryComponent implements OnInit {
  historyItems: any[] = [];
  pagedHistoryItems: any[] = [];
  showPopup = false;
  selectedItem: any = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Search & Sort
  searchTerm: string = '';
  activityFilter: string = 'all';
  sortOption: string = 'date-desc';

  constructor(
    private http: HttpClient,
    private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.getUserOrderHistory();
  }

  getUserOrderHistory() {
    const userId = this.commonService.userId;
    if (userId) {
      const url = `https://localhost:44341/CustomerPointsManagement/GetUserOrderHistory?userId=${userId}`;
      this.http.get<any[]>(url).subscribe({
        next: (data) => {
          this.historyItems = data;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to fetch user order history', err);
        }
      });
    }
  }

  applyFilters() {
    let filtered = this.historyItems;

    // Search
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(item =>
        (item.orderId && item.orderId.toString().toLowerCase().includes(term)) ||
        (item.pointType && item.pointType.toLowerCase().includes(term)) ||
        (item.item && item.item.toLowerCase().includes(term))
      );
    }

    // Activity Filter
    if (this.activityFilter !== 'all') {
      filtered = filtered.filter(item => item.pointType === this.activityFilter);
    }

    // Sort
    switch (this.sortOption) {
      case 'date-desc':
        filtered = filtered.sort((a, b) => new Date(b.pointGainedOn).getTime() - new Date(a.pointGainedOn).getTime());
        break;
      case 'date-asc':
        filtered = filtered.sort((a, b) => new Date(a.pointGainedOn).getTime() - new Date(b.pointGainedOn).getTime());
        break;
      case 'points-desc':
        filtered = filtered.sort((a, b) => b.pointGained - a.pointGained);
        break;
      case 'points-asc':
        filtered = filtered.sort((a, b) => a.pointGained - b.pointGained);
        break;
      case 'category':
        filtered = filtered.sort((a, b) => (a.pointType || '').localeCompare(b.pointType || ''));
        break;
    }

    // Pagination
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedHistoryItems = filtered.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  openDetails(index: number) {
    this.selectedItem = this.pagedHistoryItems[index];
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedItem = null;
  }
}
