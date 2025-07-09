import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx'; // Make sure xlsx is installed

interface ReportLog {
  dateTime: string;
  reportType: string;
  filters: string;
  generatedBy: string;
  format: string;
  downloadUrl: string;
}

interface PreviewRow {
  userId: string;
  email: string;
  tier: string;
  pointsEarned: number;
  pointsRedeemed: number;
  currentBalance: number;
  lastActivity: string;
}

@Component({
  selector: 'app-export-engagement-report',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './export-engagement-report.component.html',
  styleUrl: './export-engagement-report.component.css'
})
export class ExportEngagementReportComponent {
  // Report Types
  reportTypes = [
    'All User Engagement Summary',
    'Reward Redemption Activity',
    'Points Earned by Activity Type',
    'Referral Engagement Report',
    'Inactive Users Report',
    'High-Value Users'
  ];
  selectedReportType = this.reportTypes[0];

  // Date Range
  dateRanges = ['Today', 'This Week', 'Last Month', 'Year to Date', 'Custom'];
  selectedDateRange = this.dateRanges[0];
  dateStart: string = '';
  dateEnd: string = '';

  // Filters
  tiers = ['All', 'Bronze', 'Silver', 'Gold'];
  selectedTier = this.tiers[0];
  activities = ['All', 'Purchase', 'Referral', 'Review'];
  selectedActivity = this.activities[0];
  region: string = '';
  minPoints: number | null = null;
  maxPoints: number | null = null;

  // Columns
  columns = [
    { key: 'userId', label: 'User ID', selected: true },
    { key: 'email', label: 'Email', selected: true },
    { key: 'phone', label: 'Phone', selected: false },
    { key: 'joinDate', label: 'Join Date', selected: true },
    { key: 'pointsEarned', label: 'Total Points Earned', selected: true },
    { key: 'pointsRedeemed', label: 'Total Points Redeemed', selected: true },
    { key: 'currentBalance', label: 'Current Balance', selected: true },
    { key: 'lastActivity', label: 'Last Activity Date', selected: false },
    { key: 'redemptionCount', label: 'Redemption Count', selected: false },
    { key: 'referralCount', label: 'Referral Count', selected: false }
  ];

  // Export Options
  exportFormats = ['CSV', 'Excel'];
  selectedFormat = this.exportFormats[0];
  emailTo: string = '';
  scheduleOptions = ['Daily at 9 AM', 'Weekly on Monday', 'Monthly 1st'];
  selectedSchedule = this.scheduleOptions[0];
  sftpLocation: string = '';

  // Preview Data
  previewData: PreviewRow[] = [
    {
      userId: 'U123',
      email: 'jane.doe@email.com',
      tier: 'Gold',
      pointsEarned: 3000,
      pointsRedeemed: 600,
      currentBalance: 2400,
      lastActivity: '2024-07-01'
    },
    {
      userId: 'U456',
      email: 'john.smith@email.com',
      tier: 'Bronze',
      pointsEarned: 1200,
      pointsRedeemed: 0,
      currentBalance: 1200,
      lastActivity: '2024-06-28'
    }
    // Add more rows as needed
  ];

  // Export Logs
  logs: ReportLog[] = [
    {
      dateTime: '2024-07-02 09:01',
      reportType: 'All User Engagement',
      filters: 'Gold, This Week',
      generatedBy: 'admin@company.com',
      format: 'CSV',
      downloadUrl: '#'
    },
    {
      dateTime: '2024-06-25 09:01',
      reportType: 'Reward Redemption',
      filters: 'All, Last Month',
      generatedBy: 'analyst@company.com',
      format: 'CSV',
      downloadUrl: '#'
    }
    // Add more logs as needed
  ];

  constructor(private http: HttpClient) {}

  // Methods for UI interaction
  onReportTypeChange(type: string) {
    this.selectedReportType = type;
    // Optionally update previewData based on report type
  }

  onDateRangeChange(range: string) {
    this.selectedDateRange = range;
    const today = new Date();
    if (range === 'Today') {
      const d = today.toISOString().slice(0, 10);
      this.dateStart = d;
      this.dateEnd = d;
    } else if (range === 'This Week') {
      const first = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const last = new Date(today.setDate(first.getDate() + 6));
      this.dateStart = first.toISOString().slice(0, 10);
      this.dateEnd = last.toISOString().slice(0, 10);
    } else if (range === 'Last Month') {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      this.dateStart = first.toISOString().slice(0, 10);
      this.dateEnd = last.toISOString().slice(0, 10);
    } else if (range === 'Year to Date') {
      const first = new Date(today.getFullYear(), 0, 1);
      this.dateStart = first.toISOString().slice(0, 10);
      this.dateEnd = new Date().toISOString().slice(0, 10);
    } else if (range === 'Custom') {
      this.dateStart = '';
      this.dateEnd = '';
    }
  }

  onColumnToggle(col: any) {
    col.selected = !col.selected;
  }

  onExport() {
    // Implement export logic here (CSV/Excel)
    alert(`Exporting as ${this.selectedFormat}...`);
  }

  onEmailCSV() {
    const typeMap: { [key: string]: number } = {
      'All User Engagement Summary': 1,
      'Reward Redemption Activity': 2,
      'Points Earned by Activity Type': 3,
      'Referral Engagement Report': 4,
      'Inactive Users Report': 5
    };
    const type = typeMap[this.selectedReportType] || 1;
    const url = `https://localhost:44341/Reports/GetReport?type=${type}&dateStart=${this.dateStart}&dateEnd=${this.dateEnd}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        let sheetName = 'Report';
        if (type === 1) sheetName = 'Engagement Summary';
        else if (type === 2) sheetName = 'Redemption Activity';
        else if (type === 3) sheetName = 'Points By Activity';
        else if (type === 4) sheetName = 'Referral Engagement';
        else if (type === 5) sheetName = 'Inactive Users';

        // Construct HTML table for email
        let htmlTable = '';
        if (data && data.length > 0) {
          htmlTable = `
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <thead>
                <tr>
                  ${Object.keys(data[0]).map(col => `<th style="background:#185a9d;color:#fff;padding:8px;border-radius:4px;">${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(row =>
                  `<tr>${Object.values(row).map(val => `<td style="padding:8px;background:#f0f4f8;border-radius:4px;">${val ?? ''}</td>`).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          `;
        } else {
          htmlTable = `<div style="color:#888;text-align:center;">No data available for this report.</div>`;
        }

        // Construct HTML and plain text body
        const htmlBody = `
          <div style="font-family:Arial,sans-serif;background:#f6f8fa;padding:24px;">
            <div style="background:#fff;border-radius:10px;box-shadow:0 2px 8px #185a9d22;padding:32px;max-width:800px;margin:auto;">
              <h2 style="color:#185a9d;text-align:center;margin-bottom:16px;">${sheetName} Report</h2>
              <p style="font-size:16px;color:#333;text-align:center;margin-bottom:24px;">
                Please find below the <b>${sheetName}</b> report for the period <span style="color:#43cea2">${this.dateStart}</span> to <span style="color:#43cea2">${this.dateEnd}</span>.
              </p>
              ${htmlTable}
              <div style="text-align:center;">
                <span style="color:#888;font-size:13px;">This is an automated email from Loyalty Management System.</span>
              </div>
            </div>
          </div>
        `;

        let body = `${sheetName} Report\nPeriod: ${this.dateStart} to ${this.dateEnd}\n\n`;
        if (data && data.length > 0) {
          body += Object.keys(data[0]).join('\t') + '\n';
          body += data.map(row => Object.values(row).join('\t')).join('\n');
        } else {
          body += 'No data available for this report.';
        }

        const postBody = {
          from: 'onboarding@resend.dev',
          to: 'user207@labskraft.com',
          subject: `${sheetName} Report - ${this.dateStart} to ${this.dateEnd}`,
          body: body,
          html: htmlBody
        };

        this.http.post('https://localhost:44341/ResendEmailService/SendDynamicEmail', postBody).subscribe({
          next: () => {
            alert('Report email sent successfully!');
          },
          error: (err) => {
            alert('Failed to send email.');
            console.error('Email error', err);
          }
        });
      },
      error: (err) => {
        alert('Failed to fetch report data.');
        console.error('Export error', err);
      }
    });
  }

  onScheduleExport() {
    // Implement schedule logic here
    alert(`Scheduled export: ${this.selectedSchedule}`);
  }

  exportReportAsCSV() {
    const typeMap: { [key: string]: number } = {
      'All User Engagement Summary': 1,
      'Reward Redemption Activity': 2,
      'Points Earned by Activity Type': 3,
      'Referral Engagement Report': 4,
      'Inactive Users Report': 5
    };
    const type = typeMap[this.selectedReportType] || 1;
    const url = `https://localhost:44341/Reports/GetReport?type=${type}&dateStart=${this.dateStart}&dateEnd=${this.dateEnd}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        let exportData: any[] = [];
        let sheetName = 'Report';

        if (type === 1) {
          // Type 1: User Engagement Summary
          exportData = data.map(item => ({
            'ID': item.id,
            'User ID': item.userId,
            'Point Type': item.pointType,
            'User Tier': item.userTier,
            'Date': item.pointGainedOn ? new Date(item.pointGainedOn).toLocaleDateString() : '',
            'Points Gained': item.pointGained
          }));
          sheetName = 'Engagement Summary';
        } else if (type === 2) {
          // Type 2: Reward Redemption Activity
          exportData = data.map(item => ({
            'Order ID': item.orderId,
            'User ID': item.userId,
            'Point Type': item.pointType,
            'Order Value': item.orderValue,
            'Date': item.pointGainedOn ? new Date(item.pointGainedOn).toLocaleDateString() : '',
            'Points Gained': item.pointGained,
            'Item': item.item,
            'Logic': item.logic,
            'Review ID': item.reviewId,
            'Referred User Email': item.referredUserMailId
          }));
          sheetName = 'Redemption Activity';
        } else if (type === 3) {
          // Type 3: Points Earned by Activity Type
          exportData = data.map(item => ({
            'ID': item.id,
            'Name': item.name,
            'Value': item.value,
            'Required Points': item.requiredPoints,
            'Description': item.description,
            'Image URL': item.imageUrl
          }));
          sheetName = 'Points By Activity';
        } else if (type === 4) {
          // Type 4: Referral Engagement Report
          exportData = data.map(item => ({
            'User ID': item.UserId,
            'Redemption Points': item.RedemptionPoints
          }));
          sheetName = 'Referral Engagement';
        } else if (type === 5) {
          // Type 5: Inactive Users Report (empty or custom fields)
          exportData = [];
          sheetName = 'Inactive Users';
        }

        // Create worksheet and workbook
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };

        // Save to file
        XLSX.writeFile(workbook, `${sheetName}.xlsx`);
      },
      error: (err) => {
        alert('Failed to export report.');
        console.error('Export error', err);
      }
    });
  }
}
