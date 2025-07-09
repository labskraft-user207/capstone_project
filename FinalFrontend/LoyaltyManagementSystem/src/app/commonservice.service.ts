import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonserviceService {
  userId: number | null = null;
  // Add a subject for push notification status
  pushNotification$ = new BehaviorSubject<boolean>(false);

  setPushNotificationStatus(status: boolean) {
    this.pushNotification$.next(status);
  }
}
