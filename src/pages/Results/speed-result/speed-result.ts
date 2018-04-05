import { Settings } from './../../../shared/settings/settings';
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

  hasPonus = false;
  trueAnswers = 0;
  falseAnswers = 0;
  points = 0;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afa: AngularFireAuth,
    public afd: AngularFireDatabase) {

    if (this.navParams.get('userPoints') != null) {
      this.points = this.navParams.get('userPoints');
    }

    if (this.navParams.get('trueAnswers') != null && this.navParams.get('trueAnswers') > 4) {
      this.trueAnswers = this.navParams.get('trueAnswers');
      this.hasWon = true;
    }
    if (this.navParams.get('falseAnswers') != null) {
      this.falseAnswers = this.navParams.get('falseAnswers');
    }
    if (this.navParams.get('userPoints') != null
      && this.navParams.get('userPoints') > this.trueAnswers * Settings.questionPoint) {
      this.hasPonus = true;
    }
  }


  ionViewDidLoad() {

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ["إجابات صحيحة", "إجابات خاطئة"],
        datasets: [{
          label: '',
          data: [this.trueAnswers, this.falseAnswers],
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

  speedTest() {
    this.navCtrl.setRoot(SpeedTestPage);
  }

  showQuestions() {
    this.navCtrl.push(QuizQuestionsPage,
      { questions: this.navParams.get('questions') });
  }
}
