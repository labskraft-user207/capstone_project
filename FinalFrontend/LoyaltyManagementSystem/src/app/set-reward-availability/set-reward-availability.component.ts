import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface RewardAvailability {
  id: number;
  reward: string;
  status: string;
  startDate: string;
  endDate: string;
  inventory: number;
  lowInventoryAlert: boolean;
  manualOverride: boolean;
  imageUrl?: string; // Optional, for display if you want
}

@Component({
  selector: 'app-set-reward-availability',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './set-reward-availability.component.html',
  styleUrl: './set-reward-availability.component.css'
})
export class SetRewardAvailabilityComponent implements OnInit {
  rewards: RewardAvailability[] = [];
  statusOptions = ['Active', 'Out of Stock', 'Hidden', 'Scheduled Launch'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRewardAvailability();
  }

  getRewardAvailability() {
    const url = 'https://localhost:44341/RewardAvailability';
    this.http.get<RewardAvailability[]>(url).subscribe({
      next: (data) => {
        // Optionally map imageUrl if you want to display images
        this.rewards = data.map(r => ({
          ...r,
          imageUrl: r.imageUrl || 'https://img.icons8.com/color/48/gift-card.png' // fallback/default
        }));
      },
      error: (err) => {
        console.error('Failed to fetch reward availability', err);
      }
    });
  }

  onSaveChanges() {
    const url = 'https://localhost:44341/RewardAvailability';
    // Post all rewards (could be batched or one by one as per backend support)
    const requests = this.rewards.map(r => {
      const body = {
        id: r.id || 0,
        reward: r.reward,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        inventory: r.inventory,
        lowInventoryAlert: r.lowInventoryAlert,
        manualOverride: r.manualOverride
      };
      return this.http.post(url, body);
    });

    // Execute all POST requests
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        alert('Changes saved!');
      })
      .catch((err) => {
        alert('Failed to save changes!');
        console.error('Failed to save reward availability', err);
      });
  }

  onToggleAlert(reward: RewardAvailability) {
    reward.lowInventoryAlert = !reward.lowInventoryAlert;
  }

  onToggleOverride(reward: RewardAvailability) {
    reward.manualOverride = !reward.manualOverride;
  }
}
