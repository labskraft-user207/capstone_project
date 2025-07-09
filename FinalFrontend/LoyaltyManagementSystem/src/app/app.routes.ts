import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'storeadmin', loadComponent: () => import('./storeadmin-dashboard/storeadmin-dashboard.component').then(m => m.StoreadminDashboardComponent) },
  { path: 'earnedpoints', loadComponent: () => import('./earnedpoints/earnedpoints.component').then(m => m.EarnedpointsComponent) },
  { path: 'pointshistory', loadComponent: () => import('./pointshistory/pointshistory.component').then(m => m.PointshistoryComponent) },
  { path: 'redeempoints', loadComponent: () => import('./redeempoints/redeempoints.component').then(m => m.RedeempointsComponent) },
  { path: 'rewardscatalog', loadComponent: () => import('./rewardscatalog/rewardscatalog.component').then(m => m.RewardscatalogComponent) },
  { path: 'activity-tracker', loadComponent: () => import('./activity-tracker/activity-tracker.component').then(m => m.ActivityTrackerComponent) },
  { path: 'email-tracker', loadComponent: () => import('./email-tracker/email-tracker.component').then(m => m.EmailTrackerComponent) },
  { path: 'create-manage-rewards', loadComponent: () => import('./create-manage-rewards/create-manage-rewards.component').then(m => m.CreateManageRewardsComponent) },
  { path: 'set-reward-availability', loadComponent: () => import('./set-reward-availability/set-reward-availability.component').then(m => m.SetRewardAvailabilityComponent) },
  { path: 'view-all-users-points-details', loadComponent: () => import('./view-all-users-points-details/view-all-users-points-details.component').then(m => m.ViewAllUsersPointsDetailsComponent) },
  { path: 'assign-bonus-points', loadComponent: () => import('./assign-bonus-points/assign-bonus-points.component').then(m => m.AssignBonusPointsComponent) },
  { path: 'setpoint-accumulation-rules', loadComponent: () => import('./setpoint-accumulation-rules/setpoint-accumulation-rules.component').then(m => m.SetpointAccumulationRulesComponent) },
  { path: 'set-point-requirements', loadComponent: () => import('./set-point-requirements/set-point-requirements.component').then(m => m.SetPointRequirementsComponent) },
  { path: 'export-engagement-report', loadComponent: () => import('./export-engagement-report/export-engagement-report.component').then(m => m.ExportEngagementReportComponent) },
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'notauthorized', loadComponent: () => import('./not-authorized/not-authorized.component').then(m => m.NotAuthorizedComponent) }
];