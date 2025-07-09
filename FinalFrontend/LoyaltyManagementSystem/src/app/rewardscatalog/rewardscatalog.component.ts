import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient ,HttpClientModule} from '@angular/common/http';
import { CommonserviceService } from '../commonservice.service';

@Component({
  selector: 'app-rewardscatalog',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './rewardscatalog.component.html',
  styleUrl: './rewardscatalog.component.css'
})
export class RewardscatalogComponent implements OnInit {
  rewards: any[] = [];
  showPopup = false;
  selectedReward: any = null;
  wishlist: any[] = [];

  constructor(
          private http: HttpClient,
          private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.getRewardsCatalog();
  }

  getRewardsCatalog() {
    const url = `https://localhost:44341/CustomerPointsManagement/GetRewardCatalogMeta`;
      this.http.get<any[]>(url).subscribe({
    next: (data) => {
      this.rewards = data;
          this.getuserwishlistCatalog();
    },
    error: (err) => {
      console.error('Failed to fetch rewards catalog', err);
    }
  });
  }
  getuserwishlistCatalog() {
        const userId = this.commonService.userId;
        if (userId) {
    const url = `https://localhost:44341/CustomerPointsManagement/GetUserCatalogWishlist?userId=${userId}`;
    this.http.get<any>(url).subscribe({
        next: (data) => {
          const catalogIds = data.map((y: any) => y.catalogId);
          this.wishlist = this.rewards.filter(x => catalogIds.includes(x.id));
     },
        error: (err) => {
          console.error('Failed to fetch summary points', err);
        }
      });
    } else {
      console.warn('User ID is not set in CommonserviceService');
    }
  }
  openDetails(reward: any) {
    this.selectedReward = reward;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedReward = null;
  }

  addToWishlist(reward: any) {
  const userId = this.commonService.userId;
  if (!userId) {
    alert('User not logged in.');
    return;
  }
  const url = 'https://localhost:44341/CustomerPointsManagement/AddUserCatalogWishlist';
  const body = {
    userId: userId,
    catalogId: reward.id
  };
  this.http.post(url, body).subscribe({
    next: () => {
      if (!this.isInWishlist(reward)) {
        this.wishlist.push(reward);
      }
      alert('Added to wishlist!');
    },
    error: (err) => {
      alert('Failed to add to wishlist.');
      console.error('Add to wishlist error', err);
    }
  });
}

 removeFromWishlist(reward: any) {
  const userId = this.commonService.userId;
  if (!userId) {
    alert('User not logged in.');
    return;
  }
  const url = `https://localhost:44341/CustomerPointsManagement/DeleteUserCatalogWishlist?id=${reward.id}&userId=${userId}`;
  this.http.delete(url).subscribe({
    next: () => {
      this.wishlist = this.wishlist.filter(item => item.id !== reward.id);
      alert('Removed from wishlist!');
    },
    error: (err) => {
      alert('Failed to remove from wishlist.');
      console.error('Remove from wishlist error', err);
    }
  });
}

  isInWishlist(reward: any): boolean {
    return this.wishlist.some(item => item.name === reward.name);
  }
}
