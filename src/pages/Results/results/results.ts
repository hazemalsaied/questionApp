import { QuizQuestionsPage } from './../quiz-questions/quiz-questions';
import { PlayPage } from './../../Quiz/play/play';
import { Settings } from './../../../shared/settings/settings';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import firebase from 'firebase';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { User } from '../../../shared/models/user';
import { UserProvider } from '../../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {

  @ViewChild('doughnutCanvas') doughnutCanvas;
  doughnutChart: any;

  questionNum;

  userPoints = 0;
  user: User = Settings.emptyUser;

  sadFaceImageUrl = "./assets/sadface.png";
  happyFaceImageUrl = "./assets/happyface.png";


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afd: AngularFireDatabase,
    public userP: UserProvider) {
  }
  hasWon = false;
  oldSpeedScore = 0;
  userOldScore;
  validQNum = 0;

  parametrizePlayResults() {

    this.questionNum = Settings.questionNum;
    if (this.navParams.get('answerArr')) {
      let answerArr = this.navParams.get("answerArr");
      for (var i = 0; i < Settings.questionNum; i++) {
        if (answerArr[i] === "true") {
          this.validQNum += 1
        }
      }
    }
    if (this.validQNum >= (this.questionNum / 2)) {
      this.hasWon = true;
    }
    if (this.navParams.get('userPoints')) {
      this.userPoints = this.navParams.get("userPoints");
    }
    this.updateUserNumber(this.navParams.get('cat'));
  }



  updateUserNumber(catKey) {
    if (this.validQNum >= (this.questionNum / 2)) {
      this.userP.getUser().then(us => {
        this.userOldScore = this.user.pointNum;
        this.userP.updateScores(us, 'pointNum', this.userPoints,catKey,'play');
      });
    }
  }
  // if (this.validQNum >= (this.questionNum / 2)) {
  //   new Promise((resolve, reject) => {
  //     if (firebase.auth().currentUser) {
  //       let uid = firebase.auth().currentUser.uid;
  //       this.afd.object('/userProfile/' + uid).subscribe(
  //         snapshot => {
  //           this.user = snapshot;
  //           this.userOldScore = this.user.pointNum;
  //           this.user.pointNum += this.userPoints;//this.newPoints;
  //           resolve();
  //         });
  //     }
  //   }).then(_ => {
  //     this.afd.list('/userProfile/').update(this.user.$key, this.user).
  //       then(_ => { console.log('User edited'); });
  //   });
  // }


  ionViewDidLoad() {
    if (this.navParams.get('type') == 'play') {
      this.parametrizePlayResults();
    }
    if (this.navParams.get('type') == 'play') {
      this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ["إجابات صحيحة", "إجابات خاطئة"],
          datasets: [{
            labels: '',
            data: [this.validQNum, Settings.questionNum - this.validQNum],
            backgroundColor: [
              '#38c51c',
              '#D01E29'
            ],
            hoverBackgroundColor: [],
            borderWidth: 2
          }]
        }
      });
    }
  }

  play() {
    this.navCtrl.setRoot(PlayPage);
  }
  showQuestions() {
    this.navCtrl.push(QuizQuestionsPage,
      { questions: this.navParams.get('questions') });
  }

}
