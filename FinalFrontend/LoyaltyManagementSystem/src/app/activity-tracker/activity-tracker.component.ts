import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonserviceService } from '../commonservice.service';

interface ActivityTrackerResponse {
  userId: number;
  period: string;
  startDate: string;
  endDate: string;
  totalPointsEarned: number;
  goalCurrent: number;
  goalTotal: number;
  streak: number;
  activityList: { activityLabel: string; status: string }[];
  completionRates: { activityType: string; completionRate: number }[];
  enableGoalReminders: boolean;
}

@Component({
  selector: 'app-activity-tracker',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './activity-tracker.component.html',
  styleUrl: './activity-tracker.component.css'
})
export class ActivityTrackerComponent implements OnInit {
  viewMode: 'daily' | 'weekly' = 'daily';
  pushEnabled = true;

  summary = {
    pointsEarned: 0,
    goalCurrent: 0,
    goalTotal: 1000,
    goalProgress: 0,
    streak: 0
  };

  activityChecklist: { label: string; completed: boolean }[] = [];
  completionRates: { type: string; percent: number }[] = [];

  constructor(
    private http: HttpClient,
    private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.fetchActivityTracker();
  }

  setView(mode: 'daily' | 'weekly') {
    this.viewMode = mode;
    this.fetchActivityTracker();
  }

  fetchActivityTracker() {
    const userId = this.commonService.userId || 1; // fallback for demo
    const url = `https://localhost:44341/CustomerPointsManagement/GetCustomerActivityTracker?userId=${userId}&period=${this.viewMode}`;
    this.http.get<ActivityTrackerResponse>(url).subscribe({
      next: (data) => {
        this.summary = {
          pointsEarned: data.totalPointsEarned,
          goalCurrent: data.goalCurrent,
          goalTotal: data.goalTotal,
          goalProgress: data.goalTotal ? Math.round((data.goalCurrent / data.goalTotal) * 100) : 0,
          streak: data.streak
        };
        this.activityChecklist = data.activityList.map(a => ({
          label: this.capitalize(a.activityLabel),
          completed: a.status === 'Completed'
        }));
        this.completionRates = data.completionRates.map(c => ({
          type: this.capitalize(c.activityType),
          percent: c.completionRate
        }));
        this.pushEnabled = data.enableGoalReminders;
      },
      error: (err) => {
        console.error('Failed to fetch activity tracker', err);
      }
    });
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  onPushToggle() {
    const userId = this.commonService.userId || 1; // fallback for demo
    const url = 'https://localhost:44341/CustomerPointsManagement/EnableUserGoalReminders';
    const body = {
      userId: userId,
      enableGoalReminders: this.pushEnabled
    };
    this.http.post(url, body).subscribe({
      next: () => {
        // Notify dashboard if enabled
        if (this.pushEnabled) {
          this.commonService.setPushNotificationStatus(true);
        }
        console.log('Push notification preference updated:', this.pushEnabled);
      },
      error: (err) => {
        console.error('Failed to update push notification preference', err);
      }
    });
  }
}
