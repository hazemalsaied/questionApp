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
  selector: 'page-my-questions',
  templateUrl: 'my-questions.html',
})
export class MyQuestionsPage {

  questions: Array<Question> = [];
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
      this.getQuestions(user).then(questions => {
        this.questions = questions;
        console.log(this.questions);
        for (let q of this.questions) {
          q.showMe = false;
        }
      });
    })

  }

  getQuestions(user: User): Promise<Array<Question>> {
    return new Promise((resolve, reject) => {
      if (typeof user.questions != "undefined") {
        let questionArr = [];
        let promises = [];
        for (let i = 0; i < user.questions.length; i++) {
          let p = new Promise((resolve, reject) => {
            this.afd.object('/questions/' + user.questions[i].key).subscribe(item => {
              questionArr.push(item);
              resolve();
            });
          });
          promises.push(p);
        }
        Promise.all(promises).then(function (values) {
          resolve(questionArr);
        });
      } else {
        resolve([]);
      }
    });
  }
  remove(q) {
    let qIdx = this.questions.indexOf(q);
    this.questions.splice(qIdx, 1);
    for (let i = 0; i < this.user.questions.length; i++) {
      if (this.user.questions[i].key === q.$key) {
        this.user.questions.splice(i, 1);
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
    question.showMe = !question.showMe;
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
