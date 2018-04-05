import { MarketPage } from './../../UserServices/market/market';
import firebase from 'firebase';
import { User } from './../../../shared/models/user';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Question } from '../../../shared/models/question';
import { Settings } from '../../../shared/settings/settings';

@IonicPage()
@Component({
  selector: 'page-quiz-questions',
  templateUrl: 'quiz-questions.html',
})
export class QuizQuestionsPage {

  questions: Array<Question> = [];
  imageBeg = 'https://firebasestorage.googleapis.com/v0/b/questionapp-fdb6a.appspot.com/o/pictures%2F';
  imageEnd = '?alt=media';
  showSavingErrorMsg = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public afd: AngularFireDatabase) {
    this.questions = this.navParams.get("questions");
    for (let q of this.questions) {
      q.showMe = false;
    }
  }

  save(question: Question) {
    question.showMe = null;
    question.userChoice = null;
    this.getUser().then(us => {
      if (typeof us.questions == "undefined") {
        us.questions = [];
      }
      if (us.questions.length < Settings.freeSavedQuestionNum || us.unlimitedSavedQuestionNum == true) {
        us.questions.push({ key: question.$key });
        this.afd.list('/userProfile/').update(us.$key, us).then(_ => {
          let quesIdx = this.questions.indexOf(question);
          this.questions.splice(quesIdx, 1);
          this.showToast('bottom', 'تم حفظ السؤال في قائمتك!');
        });
      }
      else {
        this.showSavingErrorMsg = true;
      }
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

  report(question: Question ) {
    return new Promise((resolve, reject) => {
      if (question.reported != true) {
        question.reported = true;
        question.showMe = null;
        this.afd.list('/questions').update(question.$key, question).
          then(_ => {
            this.showToast('bottom', 'تم التبليغ عن السؤال');
            resolve();
          });
      } else { resolve(); }
    });
  }

  getAnswerTxt(question: Question, isAnswer = true) {
    let text;
    if (isAnswer) {
      text = question.answer;
    } else {
      text = question.userChoice;
    }
    if (question.answerType.toLocaleLowerCase() == 'trueorfalse') {
      if (text === 'true') {
        return 'صح';
      } else { return 'خطأ'; }
    }
    return text;
  }

  showPanel(question: Question) {
    for (let q of this.questions) {
      q.showMe = false;
    }
    question.showMe = true;
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
