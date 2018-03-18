import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { User } from '../../../shared/models/user';
import { SpeedTestPage } from '../../Quiz/speed-test/speed-test';
import { QuizQuestionsPage } from '../quiz-questions/quiz-questions';


@IonicPage()
@Component({
  selector: 'page-speed-result',
  templateUrl: 'speed-result.html',
})
export class SpeedResultPage {
  @ViewChild('doughnutCanvas') doughnutCanvas;

  doughnutChart: any;
  sadFaceImageUrl = "./assets/sadface.png";
  happyFaceImageUrl = "./assets/happyface.png";
  hasWon = false;
  speedTrueQuestionNum = 0;
  speedFalseQuestionNum = 0;
  oldSpeedScore = 0;
  oldInfiniteScore;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afa: AngularFireAuth,
    public afd: AngularFireDatabase) {

  }

  parametrizeSpeedTestResults() {
    let answerArr = this.navParams.get("answerArr");
    for (var ii = 0; ii < answerArr.length; ii++) {
      if (answerArr[ii] === "true") {
        this.speedTrueQuestionNum += 1
      }
      else if (answerArr[ii] === "false") {
        this.speedFalseQuestionNum += 1
      }
    }
    console.log(this.speedTrueQuestionNum);
    this.mainpulateUser().then(_ => {
      if (typeof this.oldSpeedScore === "undefined" || this.speedTrueQuestionNum > this.oldSpeedScore) {
        this.mainpulateUser(true).then(user => {
          this.hasWon = true;
          console.log(user);
          this.afd.list('/userProfile/').update(user.$key, user);
        });
      }
    });
  }

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


  mainpulateUser(setScore = false): Promise<User> {
    return new Promise((resolve, reject) => {
      if (firebase.auth().currentUser) {
        let uid = firebase.auth().currentUser.uid;
        this.afd.object('/userProfile/' + uid).subscribe(user => {
          if (setScore) {
            user.speedTestScore = this.speedTrueQuestionNum;
          } else {
            this.oldSpeedScore = user.speedTestScore;
          }
          resolve(user);
        });
      }
    });
  }

  ionViewDidLoad() {
    if (this.navParams.get('type') == 'speed-test') {
      this.parametrizeSpeedTestResults();
    }
    if (this.navParams.get('type') == 'speed-test') {
      this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ["إجابات صحيحة", "إجابات خاطئة"],
          datasets: [{
            label: '',
            data: [this.speedTrueQuestionNum, this.speedFalseQuestionNum],
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

  speedTest() {
    this.navCtrl.setRoot(SpeedTestPage);
  }

  showQuestions() {
    this.navCtrl.setRoot(QuizQuestionsPage,
      { questions: this.navParams.get('questions') });
  }
}
