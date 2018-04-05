import { Component, Input } from '@angular/core';
import { Settings } from '../../shared/settings/settings';

@Component({
  selector: 'user-card',
  templateUrl: 'user-card.html'
})
export class UserCardComponent {

  @Input("user") user;

  imageUrl ="./assets/profile.png";

  constructor() {
    console.log(this.user);
    if (this.user != null && this.user.imageUrl != '') {
      this.imageUrl = Settings.profileImageBeg + this.user.imageUrl + Settings.profileImageEnd;
    }
  }

}
