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

  user: User = Settings.emptyUser;

  sadFaceImageUrl = Settings.sadface;
  happyFaceImageUrl = Settings.happyFace;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afd: AngularFireDatabase,
    public userP: UserProvider) {

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
  trueAnswers = 0;
  falseAnswers = 0;
  points = 0;
  hasWon = false;
  hasPonus = false;
  userOldScore;


  ionViewDidLoad() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],// ["إجابات صحيحة", "إجابات خاطئة"],
        datasets: [{
          labels: '',
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


  play() {
    this.navCtrl.setRoot(PlayPage);
  }
  showQuestions() {
    this.navCtrl.push(QuizQuestionsPage,
      { questions: this.navParams.get('questions') });
  }

}
