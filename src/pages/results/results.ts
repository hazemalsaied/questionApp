import { Settings } from './../../shared/settings/settings';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { User } from '../../shared/models/user';

@IonicPage()
@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {
  @ViewChild('doughnutCanvas') doughnutCanvas;

  doughnutChart: any;
  questionNum;
  easyQuestionNum = Settings.easyQuestionNum;
  intermediateQuestionNum = Settings.intermediateQuestionNum;
  difficultQuestionNum = Settings.difficultQuestionNum;
  userPoints = 0;
  user$: FirebaseObjectObservable<User[]>;
  user: any = {
    key$: '',
    email: '',
    password: '',
    jokerNum: '',
    hammerNum: 3,
    pointNum: 150,
    name: '',
    role: '',
    imageUrl: '',
    sex: 'male'
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public afa: AngularFireAuth,
    public afd: AngularFireDatabase) {

    this.questionNum = Settings.questionNum;

    if (navParams.get('answerArr')) {
      this.answerArr = navParams.get("answerArr");
      for (var i = 0; i < Settings.easyQuestionNum; i++) {
        if (this.answerArr[i] === "true") {
          this.easyValidQNum += 1
        }
      }
      for (var j = Settings.easyQuestionNum; j < Settings.intermediateQuestionNum + Settings.easyQuestionNum; j++) {
        if (this.answerArr[j] === "true") {
          this.intermediateValidQNum += 1
        }
      }
      for (var q = Settings.intermediateQuestionNum + Settings.easyQuestionNum; q < Settings.questionNum; q++) {
        if (this.answerArr[q] === "true") {
          this.difficultValidQNum += 1
        }
      }
    }
    if (navParams.get('userPoints')) {
      this.userPoints = navParams.get("userPoints");
    }
    this.updateUserNumber();

  }
  newPoints = 0;
  userOldScore;
  userNewScore;
  validQNum = 0;
  easyValidQNum: number = 0;
  intermediateValidQNum: number = 0;
  difficultValidQNum: number = 0;
  answerArr = [];

  easyColor: string = 'rgba(174, 251, 121, 1)';
  easyMsg = 'سهلة لكن غير صحيحة';
  easyValidColor: string = 'rgba(93, 215, 68, 1)';
  easyValidMsg = 'سهلة وصحيحة ';

  intermediateColor: string = 'rgba(255, 219, 151, 1)';
  intermediateMsg = 'متوسطة غير صحيحة';
  intermediateValidColor: string = 'rgba(254, 218, 74, 1)';
  intermediateValidMsg = 'متوسطة وصحيحة ';

  difficultColor: string = 'rgba(255, 122, 106, 1)';
  difficultMsg = 'صعبة وغير صحيحة';
  difficultValidColor: string = 'rgba(254, 27, 28, 1)';
  difficultValidMsg = 'صعبة لكن صحيحة ';


  updateUserNumber() {

    this.validQNum = this.easyValidQNum + this.intermediateValidQNum + this.difficultValidQNum;

    if (this.validQNum >= (this.questionNum / 2)) {
      // this.newPoints = this.validQNum * Settings.questionPoint;
      new Promise((resolve, reject) => {
        if (firebase.auth().currentUser) {
          let uid = firebase.auth().currentUser.uid;
          this.user$ = this.afd.object('/userProfile/' + uid);
          this.user$.subscribe(snapshot => {

            this.user = snapshot;
            this.userOldScore = this.user.pointNum;
            this.user.pointNum += this.userPoints;//this.newPoints;
            resolve();
          });
        }
      }).then(_ => {
        this.afd.list('/userProfile/').update(this.user.$key, this.user).
          then(_ => { console.log('User edited'); });
      });
    }
  }

  ionViewDidLoad() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [this.easyValidMsg, this.easyMsg, this.intermediateValidMsg, this.intermediateMsg, this.difficultValidMsg, this.difficultMsg],
        datasets: [{
          label: '',
          data: [this.easyValidQNum, (Settings.easyQuestionNum - this.easyValidQNum),
          this.intermediateValidQNum, (Settings.intermediateQuestionNum - this.intermediateValidQNum),
          this.difficultValidQNum, (Settings.difficultQuestionNum - this.difficultValidQNum)],
          backgroundColor: [
            this.easyValidColor,
            this.easyColor,
            this.intermediateValidColor,
            this.intermediateColor,
            this.difficultValidColor,
            this.difficultColor
          ],
          hoverBackgroundColor: [],
          borderWidth: 2
        }]
      }
    });
  }

  refreshUserPoints() {

  }

  play() {
    this.navCtrl.setRoot('PlayPage');
  }
}
