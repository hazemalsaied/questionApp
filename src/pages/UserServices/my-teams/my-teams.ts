import { MarketPage } from './../../UserServices/market/market';
import firebase from 'firebase';
import { User } from './../../../shared/models/user';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Question } from '../../../shared/models/question';
import { Settings } from '../../../shared/settings/settings';
import { Team } from '../../../shared/models/team';


@IonicPage()
@Component({
  selector: 'page-my-teams',
  templateUrl: 'my-teams.html',
})
export class MyTeamsPage {

  teams: Array<Team> = [];
  imageBeg = 'https://firebasestorage.googleapis.com/v0/b/questionapp-fdb6a.appspot.com/o/pictures%2F';
  imageEnd = '?alt=media';
  showSavingErrorMsg = false;
  user: User;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase) {

    this.getUser().then(user => {
      this.user = user;
      this.getTeams(user).then(teams => {
        this.teams = teams;
        console.log(this.teams);
      });
    })

  }

  getTeams(user: User): Promise<Array<Team>> {
    return new Promise((resolve, reject) => {
      if (typeof user.teams != "undefined") {
        let teamArr = [];
        let promises = [];
        for (let i = 0; i < user.teams.length; i++) {
          let p = new Promise((resolve, reject) => {
            this.afd.object('/teams/' + user.teams[i].key).subscribe(item => {
              if (typeof(item.imageUrl) != "undefined") {
                item.imageUrl = "./assets/team.jpg";
              } else {
                item.imageUrl = this.imageBeg + item.imageUrl + this.imageEnd;
              }
              teamArr.push(item);
              resolve();
            });
          });
          promises.push(p);
        }
        Promise.all(promises).then(function (values) {
          resolve(teamArr);
        });
      } else {
        resolve([]);
      }
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
      this.showToast('bottom', 'تم حذف السؤال بنجاح!');
    });
  }


  getUser(): Promise<any> {
    let userId = firebase.auth().currentUser.uid;
    return new Promise((resolve, reject) => {
      this.afd.object('/userProfile/' + userId).subscribe(us => {
        resolve(us);
      });
    })
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
