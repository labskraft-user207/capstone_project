import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient ,HttpClientModule} from '@angular/common/http';
import { CommonserviceService } from '../commonservice.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // <-- Add this import

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, HttpClientModule, FormsModule, CommonModule], // <-- Add CommonModule here
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit{
summaryPoints: any;
   // Add variables to store response data
  totalPoints: number = 0;
  todayPoints: number = 0;
  weeklyPoints: number = 0;
  monthlyPoints: number = 0;
  purchasePoints: number = 0;
  referralPoints: number = 0;
  reviewPoints: number = 0;
  redeemptionPoints: number = 0;

  userTier: string = '';
  showSnackbar = false;

  constructor(
    private http: HttpClient,
    private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.getEarnedSummaryPoints();
    // Subscribe to push notification status
    this.commonService.pushNotification$.subscribe(status => {
      if (status) {
        this.showSnackbar = true;
        setTimeout(() => {
          this.showSnackbar = false;
          this.commonService.setPushNotificationStatus(false);
        }, 3000);
      }
    });
  }
  

  getEarnedSummaryPoints() {
    const userId = this.commonService.userId;
    if (userId) {
      const url = `https://localhost:44341/CustomerPointsManagement/GetUserPointsSummary?userId=${userId}`;
      this.http.get<any>(url).subscribe({
        next: (data) => {
          this.summaryPoints = data;
          // Save response data to variables
          this.totalPoints = data.totalPoints;
          this.todayPoints = data.todayPoints;
          this.weeklyPoints = data.weeklyPoints;
          this.monthlyPoints = data.monthlyPoints;
          this.purchasePoints = data.purchasePoints;
          this.referralPoints = data.referralPoints;
          this.reviewPoints = data.reviewPoints;
          this.redeemptionPoints = data.redemptionPoints;
          this.userTier = data.userTier;
        },
        error: (err) => {
          console.error('Failed to fetch summary points', err);
        }
      });
    } else {
      console.warn('User ID is not set in CommonserviceService');
    }
  }
}
