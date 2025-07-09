import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface ActivityRule {
  activity: string;
  points: number;
  perAmount?: number;
  limit: number;
  limitType: string;
}

interface Promotion {
  id: number;
  name: string;
  dateStart: string;
  dateEnd: string;
  multiplier: number;
}

interface TierMultiplier {
  tier: string;
  multiplier: number;
}

interface RuleVersion {
  version: string;
  date: string;
  active: boolean;
}

interface ActivityRuleApi {
  id: number;
  pointsType: string;
  points: number;
  pointPer: number;
  limits: number;
  multiplier: number;
}

interface PromotionApi {
  id: number;
  promotionName: string;
  startDate: string;
  endDate: string;
  multiplier: number;
}

@Component({
  selector: 'app-setpoint-accumulation-rules',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './setpoint-accumulation-rules.component.html',
  styleUrl: './setpoint-accumulation-rules.component.css'
})
export class SetpointAccumulationRulesComponent implements OnInit {
  activityRules: ActivityRule[] = [];
  promotions: Promotion[] = [];
  newPromotion: Promotion = { id: 0, name: '', dateStart: '', dateEnd: '', multiplier: 1 };
  tierMultipliers: TierMultiplier[] = [];
  ruleVersions: RuleVersion[] = [];
  previewAmount: number | null = null;
  previewTier: string = 'Gold';
  previewResult: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchActivityRules();
    this.fetchPromotions();
    // Initialize tierMultipliers for preview to work
    this.tierMultipliers = [
      { tier: 'Gold', multiplier: 1.2 },
      { tier: 'Silver', multiplier: 1.1 },
      { tier: 'Bronze', multiplier: 1 }
    ];
  }

  fetchActivityRules() {
    const url = 'https://localhost:44341/Rules/GetRulesByActivity';
    this.http.get<ActivityRuleApi[]>(url).subscribe({
      next: (data) => {
        this.activityRules = data.map(r => ({
          activity: r.pointsType,
          points: r.points,
          perAmount: r.pointPer,
          limit: r.limits,
          limitType: 'daily cap' // You may want to map this based on your backend
        }));
      },
      error: (err) => {
        console.error('Failed to fetch activity rules', err);
      }
    });
  }

  fetchPromotions() {
    const url = 'https://localhost:44341/Rules/GetPromotions';
    this.http.get<PromotionApi[]>(url).subscribe({
      next: (data) => {
        this.promotions = data.map(p => ({
          id: p.id,
          name: p.promotionName,
          dateStart: p.startDate.split('T')[0],
          dateEnd: p.endDate.split('T')[0],
          multiplier: p.multiplier
        }));
      },
      error: (err) => {
        console.error('Failed to fetch promotions', err);
      }
    });
  }

  addPromotion() {
    if (
      this.newPromotion.name &&
      this.newPromotion.dateStart &&
      this.newPromotion.dateEnd &&
      this.newPromotion.multiplier > 0
    ) {
      const url = 'https://localhost:44341/Rules/AddPromotion';
      const postBody = {
        id: 0,
        promotionName: this.newPromotion.name,
        startDate: this.newPromotion.dateStart,
        endDate: this.newPromotion.dateEnd,
        multiplier: this.newPromotion.multiplier
      };
      this.http.post<PromotionApi>(url, postBody).subscribe({
        next: (saved) => {
          this.promotions.push({
            id: saved.id,
            name: saved.promotionName,
            dateStart: saved.startDate.split('T')[0],
            dateEnd: saved.endDate.split('T')[0],
            multiplier: saved.multiplier
          });
          this.newPromotion = { id: 0, name: '', dateStart: '', dateEnd: '', multiplier: 1 };
        },
        error: (err) => {
          alert('Failed to add promotion.');
          console.error('Failed to add promotion', err);
        }
      });
    }
  }

  removePromotion(idx: number) {
    const promo = this.promotions[idx];
    const url = `https://localhost:44341/Rules/DeletePromotion/${promo.id}`;
    this.http.delete(url).subscribe({
      next: () => {
        this.promotions.splice(idx, 1);
      },
      error: (err) => {
        alert('Failed to delete promotion.');
        console.error('Failed to delete promotion', err);
      }
    });
  }

  revertVersion(version: RuleVersion) {
    this.ruleVersions.forEach(v => (v.active = false));
    version.active = true;
  }

  saveChanges() {
    const url = 'https://localhost:44341/Rules/UpdateRulesByActivity';
    // Post each activity rule (could be batched if backend supports)
    this.activityRules.forEach(rule => {
      let id = 0;
      if (rule.activity === 'Purchase') id = 1;
      else if (rule.activity === 'Referral') id = 2;
      else if (rule.activity === 'Review') id = 3;

      const body = {
        id: id,
        pointsType: rule.activity,
        points: rule.points,
        pointPer: rule.perAmount || 0,
        limits: rule.limit,
        multiplier: this.tierMultipliers.find(t => t.tier === rule.activity)?.multiplier || 0
      };
      this.http.post(url, body).subscribe({
        next: () => {},
        error: (err) => {
          alert('Failed to save activity rule.');
          console.error('Failed to save activity rule', err);
        }
      });
    });
    alert('Changes saved!');
  }

  simulatePreview() {
    if (this.previewAmount && this.previewTier) {
      const purchaseRule = this.activityRules.find(r => r.activity === 'Purchase');
      const tier = this.tierMultipliers.find(t => t.tier === this.previewTier);
      if (purchaseRule && tier) {
        const basePoints = Math.floor((this.previewAmount / (purchaseRule.perAmount || 1)) * purchaseRule.points);
        const tierPoints = basePoints * tier.multiplier;
        this.previewResult = `User would earn ${tierPoints} points for a ₹${this.previewAmount} purchase as ${this.previewTier}`;
      } else {
        this.previewResult = '';
      }
    } else {
      this.previewResult = '';
    }
  }

}
