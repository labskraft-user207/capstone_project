import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  username: string;
}

interface BonusAssignment {
  id: number;
  userId: number;
  bonusPoints: number;
  reason: string;
  associatedActivity: string;
  expirationDate: string;
  status: string;
  emailId?: string;
}

@Component({
  selector: 'app-assign-bonus-points',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './assign-bonus-points.component.html',
  styleUrl: './assign-bonus-points.component.css'
})
export class AssignBonusPointsComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  searchTerm: string = '';
  bonusPoints: number | null = null;
  reason: string = '';
  customReason: string = '';
  activity: string = '';
  expiration: string = '';
  approvalRequired: boolean = false;
  assignments: BonusAssignment[] = [];
  bonusHistory: BonusAssignment[] = [];
  showHistoryModal = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsers();
    this.fetchBonusAssignments();
    // this.fetchBonusHistory();
  }

  fetchUsers() {
    const url = 'https://localhost:44341/User/GetAll';
    this.http.get<User[]>(url).subscribe({
      next: data => {
        this.users = data;
        this.filteredUsers = data;
      }
    });
  }

  fetchBonusAssignments() {
    const url = 'https://localhost:44341/UserBonusPoints';
    this.http.get<BonusAssignment[]>(url).subscribe({
      next: data => {
        this.assignments = data;
      }
    });
  }

  fetchBonusHistory() {
    const url = 'https://localhost:44341/Bonus/GetBonusHistory';
    this.http.get<BonusAssignment[]>(url).subscribe({
      next: data => {
        this.bonusHistory = data;
      }
    });
  }

  searchUsers() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users.filter(
      u =>
        u.username.toLowerCase().includes(term) ||
        u.id.toString().includes(term)
    );
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.filteredUsers = [];
    // Use username for both searchTerm and display
    this.searchTerm = user.username;
  }

  assignBonusPoints() {
    if (!this.selectedUser || !this.bonusPoints || !this.reason) return;
    const url = 'https://localhost:44341/UserBonusPoints';
    const assignment = {
      id: 0,
      userId: this.selectedUser.id,
      bonusPoints: this.bonusPoints,
      reason: this.reason === 'Other' ? this.customReason : this.reason,
      associatedActivity: this.activity,
      expirationDate: this.expiration,
      status: this.approvalRequired ? 'Pending Approval' : 'Approved'
    };
    this.http.post<BonusAssignment>(url, assignment).subscribe({
      next: saved => {
        this.assignments.push(saved);
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.selectedUser = null;
    this.searchTerm = '';
    this.bonusPoints = null;
    this.reason = '';
    this.customReason = '';
    this.activity = '';
    this.expiration = '';
    this.approvalRequired = false;
  }

}
