import { TeamProvider } from './../../../providers/team/team';
import { UserProvider } from './../../../providers/user/user';
import { AddTeamPage } from './../add-team/add-team';
import { MarketPage } from './../../UserServices/market/market';
import firebase from 'firebase';
import { User } from './../../../shared/models/user';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Question } from '../../../shared/models/question';
import { Settings } from '../../../shared/settings/settings';
import { Team } from '../../../shared/models/team';


@IonicPage()
@Component({
  selector: 'page-my-teams',
  templateUrl: 'my-teams.html',
})
export class MyTeamsPage {

  teams: Array<any> = [];
  invitations: Array<any> = [];

  showSavingErrorMsg = false;
  user: User;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase,
    public alertCtrl: AlertController,
    public userP: UserProvider,
    public teamP: TeamProvider
  ) {

    this.userP.getUser().then(user => {
      this.user = user;
      this.teamP.getTeams(user).then(teams => {
        this.teams = teams;
        for (let t of this.teams) {
          t.realUsers = [];
          for (let u of t.users)
            userP.getUserByKey(u.key).then(user => {
              this.userP.setVirtualSettings(user);
              t.realUsers.push(user)
            });
        }
        console.log(this.teams);
      });
      this.getInvitations(user)
    });
  }
  getInvitations(user) {
    this.teamP.getInvitations(user).then(invitations => {
      this.invitations = invitations;
    });
  }

  getTeams(user) {
    this.teamP.getTeams(user).then(teams => {
      this.teams = teams;
    });
  }


  remove(t) {
    let qIdx = this.teams.indexOf(t);
    this.teams.splice(qIdx, 1);
    for (let i = 0; i < this.user.teams.length; i++) {
      if (this.user.teams[i].key === t.$key) {
        this.user.teams.splice(i, 1);
        break;
      }
    }
    this.afd.list('/userProfile').update(this.user.$key, this.user).then(_ => {
      this.showToast('bottom', 'تم حذف الفريق بنجاح!');
    });
  }

  // getUser(): Promise<any> {
  //   let userId = firebase.auth().currentUser.uid;
  //   return new Promise((resolve, reject) => {
  //     this.afd.object('/userProfile/' + userId).subscribe(us => {
  //       resolve(us);
  //     });
  //   })
  // }

  goToTeamPage(t) {
    this.navCtrl.push(AddTeamPage, { team: t });
  }
  acceptInvitation(t: Team) {
    this.teamP.acceptInvitation(this.user, t).then(accepted => {
      if (accepted) {
        this.showToast('bottom', 'لقد تمت إضافتك للفريق!');
        // this.getInvitations(this.user);
        this.getTeams(this.user);
      } else {
        this.showToast('bottom', 'أنت عضو في الفريق مسبقاً!');
      }

    });
  }
  removeTeam(t: Team) {
    let alert = this.alertCtrl.create({
      title: 'هل تريد حذف الفريق',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'حذف',
          handler: data => {
            let teamLength = this.user.teams.length;
            for (let i = 0; i < teamLength; i++) {
              let teamAlias = this.user.teams[i];
              if (teamAlias.key === t.$key) {
                if (t.admin == this.user.$key) {
                  this.user.teams.splice(i, 1);
                  this.afd.list('userProfile').update(this.user.$key, this.user).
                    then(userRef => {
                      this.teamP.getTeams(this.user).then(teams => {
                        this.teams = teams;
                        for (let t of this.teams) {
                          t.realUsers = [];
                          for (let u of t.users)
                            this.userP.getUserByKey(u.key).then(user => {
                              this.userP.setVirtualSettings(user);
                              t.realUsers.push(user)
                            });
                        }
                        console.log(this.teams);
                      });
                    });
                  // teamAlias.key = null;
                  break;
                } else {
                  this.showToast('bottom', 'لست مدير هذا الفريق لتقوم بحذفه!');
                }
              }
            }
          }
        }
      ]
    });
    alert.present();
  }

  showPanel(team: Question) {
    for (let q of this.teams) {
      q.showMe = false;
    }
    team.showMe = !team.showMe;
  }

  openMarketPage() {
    this.navCtrl.setRoot(MarketPage);
  }

  showToast(position: string, message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 2000
    });
    toast.onDidDismiss(this.dismissHandler);
    toast.present();
  }

  private dismissHandler() {
  }
}
