import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface TierRequirement {
  id: number;
  tier: string;
  pointsRequired: number;
  dynamicRule: string;
}

interface TimeRule {
  id: number;
  eventName: string;
  dateStart: string;
  dateEnd: string;
  discount: number;
}

@Component({
  selector: 'app-set-point-requirements',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './set-point-requirements.component.html',
  styleUrl: './set-point-requirements.component.css'
})
export class SetPointRequirementsComponent implements OnInit {
  minPoints: number = 0;
  maxPoints: number = 0;

  tierRequirements: TierRequirement[] = [];
  dynamicRuleOptions = [
    'None',
    '+10% for high demand',
    '-10% for low demand'
  ];

  timeRules: TimeRule[] = [];
  newTimeRule: Partial<TimeRule> = {
    eventName: '',
    dateStart: '',
    dateEnd: '',
    discount: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAllRulesMeta();
  }

  getAllRulesMeta() {
    const url = 'https://localhost:44341/RulesMeta/GetAllRulesMeta';
    this.http.get<any>(url).subscribe({
      next: (data) => {
        // Tier-based requirements (could be array or single object)
        if (Array.isArray(data.tierBasedRequirements)) {
          this.tierRequirements = data.tierBasedRequirements.map((t: any) => ({
            id: t.id,
            tier: t.tier,
            pointsRequired: t.pointsRequired,
            dynamicRule: t.dynamicRule
          }));
        } else if (data.tierBasedRequirements) {
          this.tierRequirements = [{
            id: data.tierBasedRequirements.id,
            tier: data.tierBasedRequirements.tier,
            pointsRequired: data.tierBasedRequirements.pointsRequired,
            dynamicRule: data.tierBasedRequirements.dynamicRule
          }];
        } else {
          this.tierRequirements = [];
        }

        // Point restrictions
        if (data.pointRestrictions) {
          this.minPoints = data.pointRestrictions.minimumPoints;
          this.maxPoints = data.pointRestrictions.maximumPoints;
        }

        // Time-based rules
        if (Array.isArray(data.timeBasedRules)) {
          this.timeRules = data.timeBasedRules.map((r: any) => ({
            id: r.id,
            eventName: r.eventName,
            dateStart: r.startDate ? r.startDate.split('T')[0] : '',
            dateEnd: r.endDate ? r.endDate.split('T')[0] : '',
            discount: r.pointAdjustments
          }));
        } else {
          this.timeRules = [];
        }
      },
      error: (err) => {
        alert('Failed to fetch rules meta.');
        console.error('Failed to fetch rules meta', err);
      }
    });
  }

  onAddTimeRule() {
    if (
      this.newTimeRule.eventName &&
      this.newTimeRule.dateStart &&
      this.newTimeRule.dateEnd
    ) {
      const url = 'https://localhost:44341/RulesMeta/UpsertTimeBasedRule';
      const body = {
        id: 0,
        eventName: this.newTimeRule.eventName,
        startDate: this.newTimeRule.dateStart,
        endDate: this.newTimeRule.dateEnd,
        pointAdjustments: this.newTimeRule.discount
      };
      this.http.post<any>(url, body).subscribe({
        next: (savedRule) => {
          this.timeRules.push({
            id: savedRule.id,
            eventName: savedRule.eventName,
            dateStart: savedRule.startDate.split('T')[0],
            dateEnd: savedRule.endDate.split('T')[0],
            discount: savedRule.pointAdjustments
          });
          this.newTimeRule = { eventName: '', dateStart: '', dateEnd: '', discount: 0 };
        },
        error: (err) => {
          alert('Failed to add time rule.');
          console.error('Failed to add time rule', err);
        }
      });
    }
  }

  onRemoveTimeRule(idx: number) {
    const rule = this.timeRules[idx];
    const url = `https://localhost:44341/RulesMeta/DeleteTimeBasedRule/${rule.id}`;
    this.http.delete(url).subscribe({
      next: () => {
        this.timeRules.splice(idx, 1);
      },
      error: (err) => {
        alert('Failed to delete time rule.');
        console.error('Failed to delete time rule', err);
      }
    });
  }

  onSaveTierRequirements() {
    const url = 'https://localhost:44341/RulesMeta/UpdateTierBasedRequirement';
    // Post each tier requirement (could be batched if backend supports)
    this.tierRequirements.forEach(tier => {
      const body = {
        id: tier.id || 0,
        tier: tier.tier,
        pointsRequired: tier.pointsRequired,
        dynamicRule: tier.dynamicRule
      };
      this.http.post(url, body).subscribe({
        next: () => {},
        error: (err) => {
          alert('Failed to save tier requirement.');
          console.error('Failed to save tier requirement', err);
        }
      });
    });
  }

  onSavePointRestriction() {
    const url = 'https://localhost:44341/RulesMeta/UpdatePointRestriction';
    const body = {
      id: 1,
      minimumPoints: this.minPoints,
      maximumPoints: this.maxPoints
    };
    this.http.post(url, body).subscribe({
      next: () => {},
      error: (err) => {
        alert('Failed to save point restriction.');
        console.error('Failed to save point restriction', err);
      }
    });
  }

  onSaveChanges() {
    this.onSaveTierRequirements();
    this.onSavePointRestriction();
    alert('Changes saved!');
  }
}
