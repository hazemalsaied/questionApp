import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free';
import { Team } from './../../../shared/models/team';
import { TeamProvider } from './../../../providers/team/team';
import { Settings } from './../../../shared/settings/settings';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { storage } from 'firebase';
import { User } from '../../../shared/models/user';
import { UserProvider } from '../../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})
export class MainPage {
  @ViewChild(Slides) slides: Slides;

  bestUser: User = Settings.emptyUser;
  user: User = Settings.emptyUser;
  bestMonthUser: User = Settings.emptyUser;
  infiniteBestUser: User = Settings.emptyUser;
  speedBestUser: User = Settings.emptyUser;
  playBestUser: User = Settings.emptyUser;
  bestTeam: Team = Settings.emptyTeam;

  appName = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public afa: AngularFireAuth,
    public afd: AngularFireDatabase,
    public userP: UserProvider,
    public teamP: TeamProvider,
    public admob: AdMobFree
  ) {
    this.appName = Settings.appName;
    this.userP.getUser().then(user => {
      this.user = user;
    });
    this.userP.getBestUser().then(user => {
      this.bestUser = user;
    });
    this.userP.getBestUser(Settings.infiniteTestType).then(user => {
      this.infiniteBestUser = user;
    });

    this.userP.getBestUser(Settings.speedTestType).then(user => {
      this.speedBestUser = user;
    });
    this.userP.getBestUser(Settings.playType).then(user => {
      this.playBestUser = user;
    });

    this.userP.getBestMonthUser().then(user => {
      this.bestMonthUser = user;
    });
    this.teamP.getBestTeam().then(team => {
      this.bestTeam = team;
    });
  }
  openPage(page) {
    this.navCtrl.push(page);
  }

  deletQuiz() {
    this.afd.list('quiz').subscribe(quizs => {
      quizs.forEach(quiz => {
        this.afd.list('quiz').remove(quiz.$key);
      })
    });
  }
  deletUserQuiz(){
    this.afd.list('userProfile').subscribe(users => {
      users.forEach(user => {
        user.quiz = null;
        this.afd.list('userProfile').update(user.$key, user);
      })
    });
  }
 
}
