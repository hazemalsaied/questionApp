import { AuxiliaryProvider } from './../../../providers/auxiliary/auxiliary';
import { Component } from '@angular/core';
import { NavController, AlertController, IonicPage, LoadingController } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database-deprecated';

import { QuestionProvider } from '../../../providers/question/question';
import { CategoryProvider } from './../../../providers/category/category';
import { AuthData } from './../../../providers/auth-data/auth-data';
import firebase from 'firebase';
import { Question, Category } from '../../../shared/models/question';

import { AddQuestionPage } from '../add-question/add-question';

@IonicPage()
@Component({
  selector: 'page-reported-questions',
  templateUrl: 'reported-questions.html',
})
export class ReportedQuestionsPage {

  questions$: FirebaseListObservable<Question[]>;
  questions: Array<Question> = [];
  categories$: FirebaseListObservable<Category[]>;
  categories: Array<Category> = [];
  currentImageUrl = '';
  imageBeg = 'https://firebasestorage.googleapis.com/v0/b/questionapp-fdb6a.appspot.com/o/pictures%2F'
  imageEnd = '?alt=media';
  currentPageIdx = 1;
  queryChild = '';
  queryKey = '';
  showLoadingBtn = true;
  showNoResultItem = false;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController,
    public questionProv: QuestionProvider,
    public loadingCtrl: LoadingController,
    public catProv: CategoryProvider,
    public afd: AngularFireDatabase,
    public authProv: AuthData,
    public auxProv: AuxiliaryProvider) {

    let loading = this.loadingCtrl.create({
      content: 'جاري تحميل الأسئلة!'
    });
    loading.present();
    this.currentPageIdx = 1
    this.showQuestions(loading);
    this.categories$ = catProv.getCats();
    this.getCats();
  }

  showQuestions(loading) {
    this.showNoResultItem = false;
    this.showLoadingBtn = true;
    this.questions$ = this.afd.list('questions',
      { query: { orderByChild: 'reported', equalTo: true, limitToLast: 30 } });
    this.getQuestions(loading);
  }

  getQuestionUserName(qs) {
    for (let q of qs) {
      q.userName = this.getUserName(q);
    }
  }
  getCats() {
    let categoryArr = [];
    new Promise((resolve, reject) => {
      this.categories$.subscribe(categoryList => {
        categoryList.forEach(category => {
          categoryArr.push(category);
        });

      });
      resolve();
    }).then(_ => { this.categories = categoryArr; });
  }

  getQuestions(loading = null) {
    let questionArr = [];
    this.questions$.subscribe(questionList => {
      questionList.forEach(question => {
        questionArr.push(question);

      });
      this.getQuestionUserName(questionArr);
      this.questions = questionArr;
      if (loading) {
        loading.dismiss();
      }
      return questionArr.reverse();
    });
  }

  getQuestionsBy(key, type) {
    let loading = this.loadingCtrl.create({
      content: 'جاري تحميل الأسئلة!'
    });
    loading.present();
    this.questions$ = this.questionProv.
      getQuestions({ orderByChild: type, equalTo: key, limitToLast: 10 });
    this.getQuestions();
    this.queryChild = type;
    this.queryKey = key;
    loading.dismiss();
  }

  editQuestion(q) {
    q.userName = null;
    this.navCtrl.push(AddQuestionPage, {
      question: q
    });
  }
  removeQuestion(question) {
    let alert = this.alertCtrl.create({
      title: 'هل تريد حذف السؤال؟',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'حذف',
          handler: data => {
            this.auxProv.changeQuestionNumber(question, true);
            this.questionProv.removeQuestion(question);
            this.getQuestions();
          }
        }
      ]
    });
    alert.present();
  }

  getCatByKey(key: string): Category {
    for (let cat of this.categories) {
      if (cat.$key === key) {
        return cat;
      }
    }
    return null;
  }
  getCatDisplayName(key: string): string {
    let cat = this.getCatByKey(key);
    if (cat !== null) {
      return cat.displayNameArabic
    }
    return null;
  }
  catHasParent(key: string): boolean {
    let cat = this.getCatByKey(key);
    if (cat !== null) {
      return cat.hasParent
    }
    return false;
  }

  openPage(page) {
    this.navCtrl.push(page);
  }

  showPanel(q) {
    q.showMe = !q.showMe;
  }

  userArr = [];

  getUserName(q: Question): string {
    let userName: string = '';
    for (let user of this.userArr) {
      if (user.key === q.user) {
        userName = user.name;
      }
    }
    if (userName !== '') {
      return userName;
    }
    this.afd.object('/userProfile/' + q.user).
      subscribe(snapshot => {
        this.userArr.push({ key: snapshot.$key, name: snapshot.name })
        userName = snapshot.name;
        q.userName = userName;
        return userName;
      });
  }
}
