import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-email-tracker',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './email-tracker.component.html',
  styleUrl: './email-tracker.component.css'
})
export class EmailTrackerComponent implements OnInit {

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.sendEmail();
  }

  sendEmail() {
    const apiKey = 're_5S7WyrpV_EJ9NVRKHq2mFUMY5EHCUkoRR';
    const url = 'https://api.resend.com/emails';

    const body = {
      from: 'onboarding@resend.dev',
      to: 'gokulsam16@gmail.com',
      subject: 'Test Email from Resend API',
      html: '<strong>Hello from Resend API!</strong>'
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    });

    this.http.post(url, body, { headers }).subscribe({
      next: (response) => {
        console.log('Email sent successfully:', response);
      },
      error: (err) => {
        console.error('Failed to send email:', err);
      }
    });
  }
}
