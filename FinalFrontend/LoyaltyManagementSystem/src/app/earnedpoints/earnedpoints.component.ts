import { Component, OnInit } from '@angular/core';
import { HttpClient ,HttpClientModule} from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule
import { CommonserviceService } from '../commonservice.service';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx'; // Install with: npm install xlsx

@Component({
  selector: 'app-earnedpoints',
  standalone: true,
  imports: [FormsModule,HttpClientModule,CommonModule],
  templateUrl: './earnedpoints.component.html',
  styleUrl: './earnedpoints.component.css'
})
export class EarnedpointsComponent implements OnInit {

  summaryPoints: any;
   // Add variables to store response data
  totalPoints: number = 0;
  todayPoints: number = 0;
  weeklyPoints: number = 0;
  monthlyPoints: number = 0;
  purchasePoints: number = 0;
  referralPoints: number = 0;
  reviewPoints: number = 0;

  userTier: string = '';
  userPointsDetails: any[] = []; // <-- Add this to store the list
  mostRecentActivities: any[] = []; // <-- Add this to store the most recent activities
  filteredActivities: any[] = []; // <-- Add this property

  // ...existing properties...
  selectedActivityType: string = 'all'; // <-- Add this property
  dateStart: string = '';               // <-- Add this property if you use it in template
  dateEnd: string = ''; 
  constructor(
    private http: HttpClient,
    private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.getEarnedSummaryPoints();
        this.getUserPointsDetails(); // <-- Trigger the new method
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

getUserPointsDetails() {
    const userId = this.commonService.userId;
    if (userId) {
      const url = `https://localhost:44341/CustomerPointsManagement/GetUserPointsDetails?userId=${userId}`;
      this.http.get<any[]>(url).subscribe({
        next: (data) => {
            this.userPointsDetails = data;

            // Find the most recent activity for each point type
            const recentActivitiesMap: { [key: string]: any } = {};

            data.forEach(item => {
            const type = item.pointType;
            // Assume item has a date property, e.g., item.date or item.activityDate
            const activityDate = new Date(item.date || item.activityDate);
            if (
              !recentActivitiesMap[type] ||
              new Date(recentActivitiesMap[type].date || recentActivitiesMap[type].activityDate) < activityDate
            ) {
              recentActivitiesMap[type] = item;
            }
            });

            // Store as a list of objects
            this.mostRecentActivities = Object.values(recentActivitiesMap);
        },
        error: (err) => {
          console.error('Failed to fetch user points details', err);
        }
      });
    } else {
      console.warn('User ID is not set in CommonserviceService');
    }
  }

  filterActivities(selectedActivityType: string, dateStart: string, dateEnd: string) {
    let filtered = this.userPointsDetails;
    this.filteredActivities =[];
    if (selectedActivityType && selectedActivityType !== 'all') {
      filtered = filtered.filter(
        activity => activity.pointType === selectedActivityType
      );
    }

    if (dateStart) {
      const start = new Date(dateStart);
      filtered = filtered.filter(
        activity => new Date(activity.pointGainedOn) >= start
      );
    }

    if (dateEnd) {
      const end = new Date(dateEnd);
      filtered = filtered.filter(
        activity => new Date(activity.pointGainedOn) <= end
      );
    }

    this.filteredActivities = filtered;
  }
   downloadReport() {
    // Use userPointsDetails for the detailed report
    const data = this.userPointsDetails.map(item => ({
      'ID': item.id,
      'User ID': item.userId,
      'Point Type': item.pointType,
      'User Tier': item.userTier,
      'Date': new Date(item.pointGainedOn).toLocaleDateString(),
      'Points Gained': item.pointGained
    }));

    // Create worksheet and workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Report': worksheet }, SheetNames: ['Report'] };

    // Save to file
    XLSX.writeFile(workbook, 'EarnedPointsReport.xlsx');
  }
}

