import { AuxiliaryProvider } from './../../../providers/auxiliary/auxiliary';
import { UserProvider } from './../../../providers/user/user';
import { CameraOptions } from '@ionic-native/camera';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';

import firebase from 'firebase';
import { storage } from 'firebase';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

import { CategoryProvider } from '../../../providers/category/category';
import { QuestionProvider } from './../../../providers/question/question';

import { Question, Category } from '../../../shared/models/question';



@IonicPage()

@Component({
  selector: 'page-add-question',
  templateUrl: 'add-question.html',
})




export class AddQuestionPage {

  categories$: FirebaseListObservable<Category[]>;
  categories: Array<Category> = [];

  catSelects: Array<any> = [];
  subCatSelects: Array<any> = [];
  catSelectValue: string = '7';
  subCatSelectValue: string = '-KywZEUUsuJFtcBu17w7';

  showErrorMsg = false;
  visibilityButtonText: string = 'إظهار الإعدادات'
  isVisible: boolean = false;
  isChildPage: boolean = false;
  questionImage = '';
  public questionsRef: firebase.database.Reference = firebase.database().ref(`/questions/`);

  public question: Question = {
    content: '',
    questionType: 'text',
    answer: '',
    answerType: 'multipleChoices',
    choices: [{ text: '' }, { text: '' }, { text: '' }],
    imageUrl: '',
    language: 'arabic',
    difficulty: "2",
    time: new Date().toISOString().slice(0, 16),
    showMe: false,
    user: '',
    userName: null,
    cat: '',
    subCat: '',
    cats: [{ key: '' }],
    DiffIdx: '',
    DiffCatIdx: '',
    DiffSubCatIdx: ''
  };
  noContentMsg = 'ولكن، ما هو سؤالك؟!';
  noAnswerMsg = 'لا يوجد جواب لهذا السؤال!';
  noImageMsg = 'الرجاء تحميل صورة للسؤال أو تغيير نوعه!';
  noChoices = 'الرجاء تعبئة كافة الخيارات!';
  noCatMsg = 'الرجاء تحديد التبويب الرئيسي!';
  noSubCatMsg = 'الرجاء تحديد التبويب الرئيسي!';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private camera: Camera,
    public catProvider: CategoryProvider,
    public userProvider: UserProvider,
    public questionProv: QuestionProvider,
    public auxProv: AuxiliaryProvider) {

    this.categories$ = catProvider.getCats();
    this.categories = this.getCats();

    this.getCatSelects();
    this.getSubCatSelects();

    this.setUser();
    if (navParams.get('question')) {
      this.question = navParams.get('question');
      this.isChildPage = true;
      this.refreshSelects();
    }

  }

  addQuestion() {
    this.showErrorMsg = false;
    if (this.validate()) {
      this.question.showMe = null;
      this.question.cat = this.catSelectValue;
      this.question.subCat = this.subCatSelectValue;
      let randomNum1 = Math.floor((Math.random() * 1000) + 1);
      this.question.DiffIdx = this.question.difficulty + randomNum1.toString();
      this.question.DiffCatIdx = this.question.difficulty + this.question.cat + randomNum1.toString();
      this.question.DiffCatIdx = this.question.difficulty + this.question.subCat + randomNum1.toString();
      if (this.question.$key) {
        this.questionProv.updateQuestion(this.question);
        this.showToast('bottom', 'تم تحرير السؤال بنجاح!');
      } else {
        this.question.time = new Date().toISOString().slice(0, 16);
        if (this.question.answerType.toLowerCase() == 'trueorfalse'
          || this.question.answerType.toLowerCase() == 'fillblanck') {
          this.question.choices = [];
        }
        this.questionsRef.push(this.question);
        this.auxProv.changeQuestionNumber(this.question);
        this.showToast('bottom', 'تمت إضافة السؤال بنجاح!');
      }
      if (this.isChildPage) {
        this.navCtrl.pop();
      }
    } else {
      this.showErrorMsg = true;
    }
  }

  validationMsg = [];

  validate() {
    this.validationMsg = [];
    if (this.question.content.trim() === '') {
      this.validationMsg.push(this.noContentMsg);
    }
    if (this.question.answer.trim() === '') {
      this.validationMsg.push(this.noAnswerMsg);
    }
    if (this.question.answerType === 'multipleChoices') {
      for (let choice of this.question.choices) {
        if (choice.text.trim() === '') {
          this.validationMsg.push(this.noChoices);
          break;
        }
      }
    }
    if (this.catSelectValue.trim() === '') {
      this.validationMsg.push(this.noCatMsg);
    }
    if (this.subCatSelectValue.trim() === '') {
      this.validationMsg.push(this.noSubCatMsg);
    }
    if (this.question.questionType === 'image' && this.question.imageUrl.trim() === '') {
      this.question.answer = this.noAnswerMsg;
      this.validationMsg.push(this.noImageMsg);
    }
    if (this.validationMsg.length === 0) {
      return true;
    }
    return false;
  }

  async uploadImage() {
    try {
      const cameraOptions: CameraOptions = {
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: this.camera.MediaType.PICTURE,
        destinationType: this.camera.DestinationType.DATA_URL,
        quality: 50,
        targetWidth: 600,
        targetHeight: 600,
        encodingType: this.camera.EncodingType.JPEG
        // ,correctOrientation: true
      };
      const result = await this.camera.getPicture(cameraOptions);
      let imageName = new Date().toISOString() + '.jpg';
      const pictures = storage().ref('pictures/' + imageName);
      const base64Image = result;
      pictures.putString(base64Image, 'base64').then((_) => {
        this.question.imageUrl = imageName;
        pictures.getDownloadURL().then((url) => {
          this.questionImage = url;
          this.question.questionType = 'image';
        });
      });

    } catch (error) {
      console.log(error);
    }
  }

  getCats() {
    let categoryArr = [];
    this.categories$.subscribe(categoryList => {
      categoryList.forEach(category => {
        categoryArr.push(category);
      });
    });
    return categoryArr;
  }

  getCatSelects() {
    for (let cat of this.categories) {
      if (!cat.hasParent) {
        this.catSelects.push({ name: cat.displayNameArabic, value: cat.$key });
      }
    }
    if (this.catSelects && this.catSelects.length > 0) {
      this.catSelectValue = this.catSelects[0].value;
    }
  }

  getSubCatSelects() {
    this.subCatSelects = []
    for (let cat of this.categories) {
      if (cat.hasParent && cat.parentKey === this.catSelectValue) {
        this.subCatSelects.push({ name: cat.displayNameArabic, value: cat.$key });
      }
    }
    if (this.subCatSelects && this.subCatSelects.length > 0) {
      this.subCatSelectValue = this.subCatSelects[0].value;
    }
  }

  refreshSelects() {
    let cat = this.getCatByKey(this.question.cat);
    if (cat !== null) {
      this.catSelectValue = cat.$key;
    }
    let subCat = this.getCatByKey(this.question.subCat);
    this.getSubCatSelects();
    if (subCat !== null) {
      this.subCatSelectValue = subCat.$key;
    }
  }

  getCatByKey(key: string): Category {
    for (let cat of this.categories) {
      if (cat.$key === key) {
        return cat;
      }
    }
    return null;
  }

  removeImage() {
    const imageRef = storage().ref('pictures/' + this.question.imageUrl);
    imageRef.delete().then(_ => {
      console.log('Image deleted!');
      this.question.imageUrl = '';
    });
  }

  setVisibility() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.visibilityButtonText = 'إخفاء الإعدادات';
    } else {
      this.visibilityButtonText = 'إظهار الإعدادات';
    }
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

  setUser() {
    let user = firebase.auth().currentUser;
    if (user) {
      this.question.user = user.uid;
    }
  }

  addDefaultAnswer() {
    if (this.question.answerType === 'trueOrFalse') {
      this.question.answer = 'true';
    }
  }

  getCaptions() {
    if (this.question.$key) {
      return 'تحرير السؤال';
    }
    return 'إضافة سؤال';
  }

  private dismissHandler() {
  }

}