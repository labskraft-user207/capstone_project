import { Component, OnInit } from '@angular/core';
import { CommonserviceService } from '../commonservice.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-redeempoints',
  standalone: true,
  imports: [HttpClientModule,CommonModule,FormsModule],
  templateUrl: './redeempoints.component.html',
  styleUrl: './redeempoints.component.css'
})
export class RedeempointsComponent implements OnInit {
  totalPoints: number = 2500;
  pointsFilter: number = 2500;
  searchTerm: string = '';
  showPopup: boolean = false;
  selectedReward: any = null;

  rewards: any[] = [];


  cart: any[] = [];

  redemptionHistory: any[] = [];

  constructor(
    private http: HttpClient,
    private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.getRewardsCatalog();
    this.getEarnedSummaryPoints();
    this.getRedemptionHistory(); // <-- Trigger the new method
  }

  getRewardsCatalog() {
    const url = `https://localhost:44341/CustomerPointsManagement/GetRewardCatalogMeta`;
      this.http.get<any[]>(url).subscribe({
    next: (data) => {
      this.rewards = data;
    },
    error: (err) => {
      console.error('Failed to fetch rewards catalog', err);
    }
  });
  }

   getEarnedSummaryPoints() {
    const userId = this.commonService.userId;
    if (userId) {
      const url = `https://localhost:44341/CustomerPointsManagement/GetUserPointsSummary?userId=${userId}`;
      this.http.get<any>(url).subscribe({
        next: (data) => {
          // Save response data to variables
          this.totalPoints = data.totalPoints;
        },
        error: (err) => {
          console.error('Failed to fetch summary points', err);
        }
      });
    } else {
      console.warn('User ID is not set in CommonserviceService');
    }
  }

  getRedemptionHistory() {
    const userId = this.commonService.userId;
    if (!userId) {
      console.warn('User ID is not set in CommonserviceService');
      return;
    }
    const url = `https://localhost:44341/CustomerPointsManagement/GetUserCatalogRedemptionList?userId=${userId}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.redemptionHistory = data;
      },
      error: (err) => {
        console.error('Failed to fetch redemption history', err);
      }
    });
  }

  filteredRewards() {
    return this.rewards.filter(r =>
      r.requiredPoints <= this.pointsFilter &&
      (this.searchTerm === '' || r.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  openDetails(reward: any) {
    this.selectedReward = reward;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedReward = null;
  }

  addToCart(reward: any) {
    if (!this.isInCart(reward)) {
      this.cart.push(reward);
    }
  }

  removeFromCart(reward: any) {
            this.cart = this.cart.filter(item => item !== reward);

    // const userId = this.commonService.userId;
    // if (!userId) {
    //   alert('User not logged in.');
    //   return;
    // }
    // const url = `https://localhost:44341/CustomerPointsManagement/DeleteUserCatalogRedemption?id=${reward.id}&userId=${userId}`;
    // this.http.delete(url).subscribe({
    //   next: () => {
    //     alert('Removed from redemption cart!');
    //   },
    //   error: (err) => {
    //     alert('Failed to remove from redemption cart.');
    //     console.error('Remove redemption error', err);
    //   }
    // });
  }

  isInCart(reward: any): boolean {
    return this.cart.some(item => item.name === reward.name);
  }

  checkout() {
    const userId = this.commonService.userId;
    if (!userId) {
      alert('User not logged in.');
      return;
    }
    if (this.cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const url = 'https://localhost:44341/CustomerPointsManagement/AddUserCatalogRedemptionList';
    const now = new Date();
    const body = this.cart.map((reward: any) => ({
      id: 0, // Assuming new redemption, set to 0 or let backend handle
      userId: userId,
      name: reward.name,
      catalogId: reward.id,
      date: now,
      status: 'Approved'
    }));

    this.http.post(url, body).subscribe({
      next: () => {
        alert('Redemption request submitted!');
        this.cart = [];
        // Optionally refresh redemptionHistory here
      },
      error: (err) => {
        alert('Failed to submit redemption request.');
        console.error('Redemption error', err);
      }
    });
  }
}
