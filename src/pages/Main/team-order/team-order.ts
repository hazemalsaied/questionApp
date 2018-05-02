import { UserProvider } from './../../../providers/user/user';
import { TeamProvider } from './../../../providers/team/team';
import { Team } from './../../../shared/models/team';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-team-order',
  templateUrl: 'team-order.html',
})
export class TeamOrderPage {
  teams: Array<any> = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public teamP: TeamProvider,
    public userP: UserProvider) {

    if (navParams.get('teams') != null) {
      this.teams = navParams.get('teams');
    } else {
      this.teamP.getBestTeams().then(teams => {
        this.teams = teams.reverse();
        for (let t of this.teams) {
          t.realUsers = [];
          for (let u of t.users)
            userP.getUserByKey(u.key).then(user => {
              this.userP.setVirtualSettings(user);
              t.realUsers.push(user)
            });
        }
      });
    }
  }


}
