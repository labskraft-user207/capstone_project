import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface UserSummary {
  id: number;
  username: string;
  roleId: number;
  emailId: string;
  signupDate: string;
  status: string;
  tier: string;
  activePoints: number;
  earnedPoints: number;
  referralPoints: number;
  reviewPoints: number;
  purchasePoints: number;
  redemptionPoints: number;
}

@Component({
  selector: 'app-view-all-users-points-details',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './view-all-users-points-details.component.html',
  styleUrl: './view-all-users-points-details.component.css'
})
export class ViewAllUsersPointsDetailsComponent implements OnInit {
  userSummaries: UserSummary[] = [];
  filteredUserSummaries: UserSummary[] = [];
  searchTerm: string = '';
  sortOption: string = 'Points';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAllUserSummary();
  }

  getAllUserSummary() {
    const url = 'https://localhost:44341/User/GetAllUserSummary';
    this.http.get<UserSummary[]>(url).subscribe({
      next: (data) => {
        this.userSummaries = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to fetch user summary details', err);
      }
    });
  }

  applyFilters() {
    let filtered = this.userSummaries;

    // Search
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.emailId.toLowerCase().includes(term) ||
        user.id.toString().includes(term)
      );
    }

    // Sort
    if (this.sortOption === 'Points') {
      filtered = filtered.slice().sort((a, b) => b.activePoints - a.activePoints);
    } else if (this.sortOption === 'Tier') {
      filtered = filtered.slice().sort((a, b) => a.tier.localeCompare(b.tier));
    } else if (this.sortOption === 'Signup Date') {
      filtered = filtered.slice().sort((a, b) => new Date(b.signupDate).getTime() - new Date(a.signupDate).getTime());
    }

    this.filteredUserSummaries = filtered;
  }

  exportCSV() {
    const header = [
      'User', 'Email', 'Tier', 'Active Points', 'Earned', 'Referral', 'Review', 'Purchase', 'Redeemed', 'Signup Date', 'Status'
    ];
    const rows = this.filteredUserSummaries.map(user => [
      user.username,
      user.emailId,
      user.tier,
      user.activePoints,
      user.earnedPoints,
      user.referralPoints,
      user.reviewPoints,
      user.purchasePoints,
      user.redemptionPoints,
      user.signupDate,
      user.status
    ]);
    const csv = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users_points.csv';
    a.click();
  }
}
