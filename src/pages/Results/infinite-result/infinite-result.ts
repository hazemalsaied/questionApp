import { QuizQuestionsPage } from './../quiz-questions/quiz-questions';
import { User } from './../../../shared/models/user';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { InfiniteTestPage } from '../../Quiz/infinite-test/infinite-test';
import { Settings } from '../../../shared/settings/settings';

@IonicPage()
@Component({
  selector: 'page-infinite-result',
  templateUrl: 'infinite-result.html',
})
export class InfiniteResultPage {

  @ViewChild('doughnutCanvas') doughnutCanvas;
  doughnutChart: any;

  sadFaceImageUrl = "./assets/sadface.png";
  happyFaceImageUrl = "./assets/happyface.png";

  hasWon = false;
  hasPonus = false;
  trueAnswers = 0;
  points = 0

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afd: AngularFireDatabase) {
    if (this.navParams.get('trueAnswers') != null) {
      this.trueAnswers = this.navParams.get('trueAnswers');
      if (this.trueAnswers > 4) {
        this.hasWon = true;
      }
    }
    this.points = this.navParams.get('points');
    if (this.trueAnswers * Settings.questionPoint != this.points) {
      this.hasPonus = true;
    }
  }

  infiniteTest() {
    this.navCtrl.setRoot(InfiniteTestPage);
  }

  showQuestions() {
    this.navCtrl.push(QuizQuestionsPage,
      { questions: this.navParams.get('questions') });
  }

}
