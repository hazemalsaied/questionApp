import { QuizQuestionsPage } from './../quiz-questions/quiz-questions';
import { User } from './../../../shared/models/user';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { InfiniteTestPage } from '../../Quiz/infinite-test/infinite-test';

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
  infiniteTrueQuestionNum = 0;
  oldInfiniteScore;
  hasWon = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public afd: AngularFireDatabase) {

    if (this.navParams.get('type') == 'infinite-test') {
      this.parametrizeInfiniteResults();
    }
  }

  parametrizeInfiniteResults() {
    let answerArr = this.navParams.get("answerArr");
    for (var ii = 0; ii < answerArr.length; ii++) {
      if (answerArr[ii] === "true") {
        this.infiniteTrueQuestionNum += 1
      }
    }
    this.updateUser().then(_ => {
      if (typeof this.oldInfiniteScore === "undefined" || this.infiniteTrueQuestionNum > this.oldInfiniteScore) {
        this.updateUser(true).then(snapshot => {
          this.hasWon = true;
          this.afd.list('/userProfile/').update(snapshot.$key, snapshot);
        });
      }
    });
  }

  updateUser(setScore = false): Promise<User> {
    return new Promise((resolve, reject) => {
      if (firebase.auth().currentUser) {
        let uid = firebase.auth().currentUser.uid;
        this.afd.object('/userProfile/' + uid).subscribe(user => {
          if (setScore) {
            user.infiniteScore = this.infiniteTrueQuestionNum;
          } else {
            this.oldInfiniteScore = user.infiniteScore;
          }
          resolve(user);
        });
      }
    });
  }

  infiniteTest() {
    this.navCtrl.setRoot(InfiniteTestPage);
  }

  showQuestions(){
    this.navCtrl.setRoot(QuizQuestionsPage,
      { questions: this.navParams.get('questions') });
  }

}
