import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CommonserviceService } from '../commonservice.service'; // <-- Import the service

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  regUsername: string = '';
  regPassword: string = '';
  regConfirmPassword: string = '';
  regEmail: string = '';
  showLogin: boolean = true;

  constructor(
    private router: Router,
    private http: HttpClient,
    private commonService: CommonserviceService // <-- Inject the service
  ) {}

  ngOnInit() {}

  toggleForm() {
    this.showLogin = !this.showLogin;
  }

  login() {
    const url = `https://localhost:44341/User/AuthenticateUser?username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`;
    this.http.get<{ roleId: number, userId: number }>(url).subscribe({
      next: (response) => {
        // Set userId in CommonserviceService
        this.commonService.userId = response.userId;

        // Navigate based on roleId
        if (response.roleId === 1) {
          this.router.navigate(['/dashboard']);
        } else if (response.roleId === 2) {
          this.router.navigate(['/storeadmin']);
        }
      },
      error: (err) => {
        this.router.navigate(['/notauthorized']);
        console.error('Login failed', err);
      }
    });
  }

  register() {
    const url = `https://localhost:44341/User/RegisterUser`;
    const body = {
      username: this.regUsername,
      password: this.regPassword,
      roleId: 1
    };
    this.http.post(url, body).subscribe({
      next: () => {
        alert('Registration successful! Please login.');
        this.toggleForm();
      },
      error: (err) => {
        alert('Registration failed.');
        console.error('Registration error', err);
      }
    });
  }
}