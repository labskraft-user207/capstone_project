import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

export interface RewardApi {
  id: number;
  rewardName: string;
  rewardType: string;
  category: string;
  status: string;
  description: string;
  imageUrl: string;
  pointsRequired: number;
  inventoryQuality: number;
  expiryDate: string;
  selected?: boolean;
}

@Component({
  selector: 'app-create-manage-rewards',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './create-manage-rewards.component.html',
  styleUrl: './create-manage-rewards.component.css'
})
export class CreateManageRewardsComponent implements OnInit {
  rewards: RewardApi[] = [];
  newReward: Partial<RewardApi> = this.getEmptyReward();
  isEditing = false;
  showForm = false;

  searchTerm = '';
  filterStatus = 'All';
  minPoints: number | null = null;
  maxPoints: number | null = null;
  selectAll = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getRewardsList();
  }

  getRewardsList() {
    const url = 'https://localhost:44341/UserCatalogWishManageList';
    this.http.get<RewardApi[]>(url).subscribe({
      next: (data) => {
        this.rewards = data;
      },
      error: (err) => {
        console.error('Failed to fetch rewards list', err);
      }
    });
  }

  get filteredRewards() {
    return this.rewards.filter(r =>
      (this.searchTerm === '' || r.rewardName.toLowerCase().includes(this.searchTerm.toLowerCase()) || r.category.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (this.filterStatus === 'All' || r.status === this.filterStatus) &&
      (this.minPoints === null || r.pointsRequired >= this.minPoints) &&
      (this.maxPoints === null || r.pointsRequired <= this.maxPoints)
    );
  }

  getEmptyReward(): Partial<RewardApi> {
    return {
      rewardName: '',
      rewardType: 'Gift Card',
      category: '',
      status: 'Active',
      description: '',
      imageUrl: '',
      pointsRequired: 0,
      inventoryQuality: 0,
      expiryDate: ''
    };
  }

  onAddNewReward() {
    this.newReward = this.getEmptyReward();
    this.isEditing = false;
    this.showForm = true;
  }

  onSaveReward() {
    const url = 'https://localhost:44341/UserCatalogWishManageList';
    const rewardToSave: RewardApi = {
      id: this.isEditing && this.newReward.id != null ? this.newReward.id : 0,
      rewardName: this.newReward.rewardName || '',
      rewardType: this.newReward.rewardType || '',
      category: this.newReward.category || '',
      status: this.newReward.status || 'Active',
      description: this.newReward.description || '',
      imageUrl: this.newReward.imageUrl || '',
      pointsRequired: this.newReward.pointsRequired || 0,
      inventoryQuality: this.newReward.inventoryQuality || 0,
      expiryDate: this.newReward.expiryDate || ''
    };

    this.http.post<RewardApi>(url, rewardToSave).subscribe({
      next: (savedReward) => {
        if (this.isEditing && this.newReward.id != null) {
          const idx = this.rewards.findIndex(r => r.id === this.newReward.id);
          if (idx > -1) this.rewards[idx] = savedReward;
        } else {
          this.rewards.push(savedReward);
        }
        this.showForm = false;
      },
      error: (err) => {
        alert('Failed to save reward.');
        console.error('Failed to save reward', err);
      }
    });
  }

  onEditReward(reward: RewardApi) {
    this.newReward = { ...reward };
     if (reward.expiryDate) {
    this.newReward.expiryDate = reward.expiryDate.split('T')[0];
    }
    this.isEditing = true;
    this.showForm = true;
  }

  onDeleteReward(reward: RewardApi) {
    const url = `https://localhost:44341/UserCatalogWishManageList/${reward.id}`;
    this.http.delete(url).subscribe({
      next: () => {
        this.rewards = this.rewards.filter(r => r.id !== reward.id);
      },
      error: (err) => {
        alert('Failed to delete reward.');
        console.error('Failed to delete reward', err);
      }
    });
  }

  onFilter() {
    // Filtering is handled by getter
  }

  onSelectAllChange() {
    this.filteredRewards.forEach(r => r.selected = this.selectAll);
  }

  onBulkDelete() {
    const selectedIds = this.filteredRewards.filter(r => r.selected).map(r => r.id);
    if (selectedIds.length === 0) return;

    const url = 'https://localhost:44341/UserCatalogWishManageList/BulkDelete';
    this.http.request('post', url, { body: selectedIds }).subscribe({
      next: () => {
        this.rewards = this.rewards.filter(r => !selectedIds.includes(r.id));
        this.selectAll = false;
      },
      error: (err) => {
        alert('Bulk delete failed.');
        console.error('Bulk delete error', err);
      }
    });
  }

  onBulkActivate() {
    const selectedRewards = this.filteredRewards.filter(r => r.selected);
    if (selectedRewards.length === 0) return;

    // Prepare updated rewards with status 'Active'
    const updatedRewards = selectedRewards.map(r => ({
      ...r,
      status: 'Active'
    }));

    const url = 'https://localhost:44341/UserCatalogWishManageList/Bulk';
    this.http.post<RewardApi[]>(url, updatedRewards).subscribe({
      next: (response) => {
        // Update local rewards list
        updatedRewards.forEach(updated => {
          const idx = this.rewards.findIndex(r => r.id === updated.id);
          if (idx > -1) this.rewards[idx].status = 'Active';
        });
        this.selectAll = false;
      },
      error: (err) => {
        alert('Bulk activate failed.');
        console.error('Bulk activate error', err);
      }
    });
  }

  onBulkDeactivate() {
    const selectedRewards = this.filteredRewards.filter(r => r.selected);
    if (selectedRewards.length === 0) return;

    // Prepare updated rewards with status 'Inactive'
    const updatedRewards = selectedRewards.map(r => ({
      ...r,
      status: 'Inactive'
    }));

    const url = 'https://localhost:44341/UserCatalogWishManageList/Bulk';
    this.http.post<RewardApi[]>(url, updatedRewards).subscribe({
      next: (response) => {
        // Update local rewards list
        updatedRewards.forEach(updated => {
          const idx = this.rewards.findIndex(r => r.id === updated.id);
          if (idx > -1) this.rewards[idx].status = 'Inactive';
        });
        this.selectAll = false;
      },
      error: (err) => {
        alert('Bulk deactivate failed.');
        console.error('Bulk deactivate error', err);
      }
    });
  }
}
