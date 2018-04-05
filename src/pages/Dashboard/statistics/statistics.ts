import { Settings } from './../../../shared/settings/settings';
import { AuxiliaryProvider } from './../../../providers/auxiliary/auxiliary';
import { User } from './../../../shared/models/user';
import { UserProvider } from './../../../providers/user/user';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';

import { QuestionProvider } from './../../../providers/question/question';
import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import firebase from 'firebase';
import { CategoryProvider } from '../../../providers/category/category';
import { Category } from '../../../shared/models/question';

@IonicPage()
@Component({
  selector: 'page-statistics',
  templateUrl: 'statistics.html',
})
export class StatisticsPage {

  users$: FirebaseListObservable<User[]>;
  public userStats: Array<any> = [];

  totalQuestionNum: number;

  categories$: FirebaseListObservable<Category[]>;
  categories: Array<Category> = [];
  mainCats: Array<Category> = [];
  subCats: Array<Category> = [];


  hazemVisible: boolean = false;


  constructor(
    public alertCtrl: AlertController,
    public questProv: QuestionProvider,
    public catProv: CategoryProvider,
    public afd: AngularFireDatabase,
    public userProv: UserProvider,
    public loadingCtrl: LoadingController,
    public auxProv: AuxiliaryProvider) {

    this.hazemVisible = this.isHazem();
    let users$ = this.afd.list('/userProfile');
    users$.subscribe(userList => {
      this.userStats = [];
      userList.forEach(user => {
        if (user.questionNumber && user.questionNumber > 0) {
          let imageLink = Settings.userImage;
          if (user.imageUrl) {
            imageLink = Settings.profileImageBeg + user.imageUrl + Settings.profileImageEnd;
          }
          this.userStats.push({ user: user.name, imageLink: imageLink, questionNumber: user.questionNumber, key: user.$key, visibe: false });
        }
      });
    });

    this.afd.list('categories/').subscribe(categoryList => {
      this.mainCats = [];
      categoryList.forEach(category => {
        if (!category.hasParent) {
          category.showSubCats = false;
          this.mainCats.push(category);
        };
        this.categories.push(category);
      });
    });

    this.afd.object('/statistics').subscribe(data => {
      this.totalQuestionNum = data.questionNumber;
    });

    // this.afd.list('questions/', { orderByChild: 'cat', equalTo: null }).
    //   subscribe(questionList => {
    //     console.log(questionList.length)
    //   });
  }

  isHazem() {
    if (firebase.auth().currentUser.email === 'hazemalsaied@gmail.com') {
      return true;
    }
    return false;
  }

  addRandomIndices() {
    let alert = this.alertCtrl.create({
      title: 'هل تريد  توليد فهارس عشوائية لكافة الأسئلة؟',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'توليد',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.questProv.addRandomIndices();
            loadingPopup.dismiss();
          }
        }
      ]
    });
    alert.present();
  }

  setUser4All() {
    let alert = this.alertCtrl.create({
      title: 'هل تريد ضبط كافة الأسئلة',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'ضبط',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.questProv.setUser4AllQuestions();
            loadingPopup.dismiss();

          }
        }
      ]
    });
    alert.present();
  }

  setUsersInfo() {
    let alert = this.alertCtrl.create({
      title: 'هل تريد ضبط معلومات كافة المستخدمين',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'ضبط',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.userProv.setAllUserInfo();
            loadingPopup.dismiss();
          }
        }
      ]
    });
    alert.present();
  }

  denormalizeCats() {
    let alert = this.alertCtrl.create({
      title: 'هل تريد إعادة تهيئة تبويبات كافة الأسئلة',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'ضبط',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.questProv.setCats4AllQuestions();
            loadingPopup.dismiss();
          }
        }
      ]
    });
    alert.present();
  }


  addTimeToColumns() {
    let alert = this.alertCtrl.create({
      title: 'هل تريد إعادة تهيئة التوقيت لكافة الأسئلة',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'ضبط',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.questProv.setCatTime4AllQuestions();
            loadingPopup.dismiss();
          }
        }
      ]
    });
    alert.present();
  }

  setInitialQNumber() {
    let alert = this.alertCtrl.create({
      title: 'هل تريد إعادة تهيئة التوقيت لكافة الأسئلة',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'ضبط',
          handler: data => {
            let loadingPopup = this.loadingCtrl.create({
              spinner: 'crescent',
              content: ''
            });
            loadingPopup.present();
            this.auxProv.setInitialQuestionNumber();
            loadingPopup.dismiss();
          }
        }
      ]
    });
    alert.present();
  }

  showSubCatStats(cat) {
    this.subCats = [];
    for (let c1 of this.categories) {
      c1.showSubCats = false;
    }
    if (cat.showSubCats) {
      cat.showSubCats = !cat.showSubCats;
    } else {
      cat.showSubCats = true;
    }
    for (let c of this.categories) {
      if (c.hasParent && c.parentKey == cat.$key) {
        this.subCats.push(c);
        c.showMe = cat.showSubCats;
      }
    }
  }
}
