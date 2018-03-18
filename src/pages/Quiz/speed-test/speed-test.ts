import { Settings } from './../../../shared/settings/settings';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

import { QuestionProvider } from '../../../providers/question/question';
import { CategoryProvider } from './../../../providers/category/category';
import firebase from 'firebase';
import { Question, Category } from '../../../shared/models/question';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { SpeedResultPage } from '../../Results/speed-result/speed-result';

@IonicPage()
@Component({
  selector: 'page-speed-test',
  templateUrl: 'speed-test.html',
})
export class SpeedTestPage {

  public imageBeg = Settings.imageBeg;
  public imageEnd = Settings.imageEnd;

  questionIdx: number = -1;

  userPoints = 0;
  progressValue: number = 0;

  questions: Array<Question> = [];
  categories$: FirebaseListObservable<Category[]> = this.catProvider.getCats();;

  currentChoices = [];
  choiceBkgs = {};
  quizType: string = 'all';
  selectedCat: string = '';
  selectedSubCat: string = '';

  userAnswer: string = ''
  hasAnswered: boolean = false;
  catSelects = [];
  userAnswerArr = [];
  subCatSelects = [];


  showQuiz: boolean = false;
  showCatSelect: boolean = false;
  showSubCatSelect: boolean = false;

  showStormBtn: boolean = false;

  currentQuestion: Question = {
    content: '',
    questionType: 'text',
    answer: '',
    answerType: 'multipleChoices',
    choices: [{ text: '' }, { text: '' }, { text: '' }],
    imageUrl: '',
    language: 'arabic',
    difficulty: "2",
    time: new Date().toISOString().slice(0, 16),
    user: '',
    userName: null,
    cat: '',
    subCat: '',
    DiffIdx: '',
    DiffCatIdx: '',
    DiffSubCatIdx: '',
  };

  constructor(public navCtrl: NavController,
    public afd: AngularFireDatabase,
    public questionProv: QuestionProvider,
    public catProvider: CategoryProvider,
    public loadingCtrl: LoadingController) {
    this.getAllCats().then(_ => {
      this.getMainCats();
    });
    this.getLastIdx();
  }

  startQuiz() {
    let loading = this.loadingCtrl.create({
      content: 'جاري تحميل الكويز'
    });
    loading.present();
    this.getQuestions(Settings.initQuesNumForSpeedTest).then(questions3 => {
      questions3.forEach(q => {
        this.questions.push(q);
      });
      this.userAnswerArr = this.getQuestionIdxArr();
      this.showQuiz = true;
      this.getNextQuestion();
      this.startProgressInterval();
      loading.dismiss();
    });
  }


  getNextQuestion() {
    this.initializeQuestionPanel();
    if (this.questionIdx < (this.questions.length - 1)) {
      this.questionIdx += 1;
      this.currentQuestion = this.questions[this.questionIdx];
      this.currentChoices = this.getChoices(this.currentQuestion);

      // if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse') {
      //   this.showStormBtn = false;
      // } else {
      //   this.showStormBtn = true;
      // }
    }
  }

  next(choice) {
    this.selectChoice(choice);
    this.validate();
    setTimeout(() => {
      this.getNextQuestion();
    }, Settings.waitingTimeSpeed);
  }

  validate() {
    this.currentQuestion.userChoice = this.userAnswer;
    let userAnswerTmp = this.userAnswer;
    let answerTmp = this.replaceNumbers(this.currentQuestion.answer);
    answerTmp = this.replaceAleph(answerTmp);
    this.hasAnswered = true;
    if ((this.currentQuestion.answerType.toLocaleLowerCase() === 'fillblanck') ||
      (this.currentQuestion.answerType.toLocaleLowerCase() === 'multiplechoices')) {
      userAnswerTmp = this.replaceNumbers(this.userAnswer);
      userAnswerTmp = this.replaceAleph(userAnswerTmp);
    }

    this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
    if (userAnswerTmp.toLocaleLowerCase() === answerTmp.toLocaleLowerCase()) {
      this.userPoints += Settings.questionPoint;
      this.userAnswerArr[this.questionIdx] = 'true';
    } else {
      this.userAnswerArr[this.questionIdx] = 'false';
      this.choiceBkgs[this.userAnswer] = Settings.dangerColor;
    }
  }

  getQuestions(quesNum): Promise<Array<any>> {
    let questionArr = [];
    return new Promise((resolve, reject) => {
      let promises = [];
      for (let i = 0; i < quesNum; i++) {
        let p = new Promise((resolve, reject) => {
          let diff = parseInt(String(Math.random() * (4 - 1) + 1));
          this.getRef(diff, true).subscribe( questions => {
            questions.forEach(function (child) {
              questionArr.push(child);
              return false;
            });
            resolve();
          });
        });
        promises.push(p);
      }
      Promise.all(promises).then(function (values) {
        let arr = [];
        for (var key in questionArr) {
          if (questionArr.hasOwnProperty(key)) {
            arr.push(questionArr[key]);
          }
        }
        resolve(arr);
      });
    });
  }

  getRef(diff, oneQuestion = false) {
    let randomNum;
    if (diff == "1") {
      randomNum = parseInt(String(Math.random() * (this.easyLastIdx - 1) + 1));
    } else if (diff == "2") {
      randomNum = parseInt(String(Math.random() * (this.interLastIdx - 1) + 1));
    } else if (diff == "3") {
      randomNum = parseInt(String(Math.random() * (this.diffLastIdx - 1) + 1));
    }
    let catInfo = '';
    let field = 'DiffIdx';
    let questionNum = Settings.easyQuestionNum;
    if (this.selectedSubCat) {
      field = 'DiffSubCatIdx';
      catInfo = this.selectedSubCat;
    }
    else if (this.selectedCat) {
      field = 'DiffCatIdx';
      catInfo = this.selectedCat;
    }
    if (oneQuestion) {
      questionNum = 1;
    } else if (diff == "2") {
      questionNum = Settings.intermediateQuestionNum;
    }
    else if (diff == "3") {
      questionNum = Settings.difficultQuestionNum;
    }
    return this.afd.list('/questions',
      {
        query: { 
          orderByChild: field,
          startAt: diff + catInfo + randomNum.toString(),
          limitToFirst: questionNum
        }
      });
  }

  initializeQuestionPanel() {
    this.setDefaultColor();
    this.hasAnswered = false;
    this.userAnswer = '';
  }

  progressInterval;

  startProgressInterval() {
    this.progressInterval = setInterval(() => {
      this.increaseProgress(this.progressInterval)
    }, Settings.progressBarSpeed);
  }

  increaseProgress(interval) {
    if (this.progressValue < 100) {
      this.progressValue += 2;
    } else if (this.progressValue == 100) {
      clearInterval(this.progressInterval);
      this.moveToResultPage();
    }
  }

  getQuestionIdxArr() {
    var list = [];
    for (var i = 0; i < Settings.initQuesNumForSpeedTest; i++) {
      list.push('none');
    }
    return list;
  }

  selectChoice(choice) {
    this.userAnswer = choice;
    this.setDefaultColor();
    this.choiceBkgs[choice] = Settings.activeChoiceColor;
  }

  getChoices(q: Question) {
    let result = [{ text: q.answer, isTrue: true }];
    if (q.choices) {
      for (let c of q.choices) {
        result.push({ text: c.text, isTrue: false })
      }
      if (result.length > 1) {
        result = Settings.shuffle(result)
      }
      this.setDefaultColor();
      return result;
    } else {
      this.setDefaultColor();
      return [];
    }
  }

  setDefaultColor() {
    this.choiceBkgs = {};
    if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse') {
      this.choiceBkgs['true'] = Settings.choiceColor;
      this.choiceBkgs['false'] = Settings.choiceColor;
    }
    else {
      for (let c of this.currentQuestion.choices) {
        this.choiceBkgs[c.text] = Settings.choiceColor;
      }
      this.choiceBkgs[this.currentQuestion.answer] = Settings.choiceColor;
    }
  }

  allCats: Array<Category> = [];
  mainCats: Array<Category> = [];
  subCats: Array<Category> = [];

  getAllCats(): Promise<any> {
    let loading = this.loadingCtrl.create({
      content: 'جاري تحميل الكويز'
    });
    loading.present();
    return new Promise((resolve, reject) => {
      if (this.allCats.length === 0) {
        this.categories$.subscribe(cats => {
          cats.forEach(cat => {
            cat.showMe = false;
            this.allCats.push(cat);
          });
          loading.dismiss();
          resolve();
        });
      } else {
        loading.dismiss();
        resolve();
      }
    });
  }

  getMainCats() {
    for (let cat of this.allCats) {
      if (!cat.hasParent) {
        this.mainCats.push(cat);
      }
    }
  }

  getSubCats(parentKey) {
    this.subCats = [];
    for (let cat of this.allCats) {
      if (cat.hasParent && cat.parentKey === parentKey) {
        this.subCats.push(cat);
      }
    }
  }

  selectSubCat(cat) {
    this.selectedCat = '';
    this.selectedSubCat = cat.$key;
    this.startQuiz();
  }

  selectCat(cat) {
    if (cat == null) {
      this.selectedCat = '';
      this.selectedSubCat = '';
      this.startQuiz();
    } else if (this.selectedCat == cat.$key) {
      this.startQuiz();
    } else {
      this.selectedSubCat = '';
      this.selectedCat = cat.$key;
      for (let c of this.mainCats) {
        c.showMe = false;
      }
      cat.showMe = true;
      this.getSubCats(cat.$key);
    }
  }

  easyLastIdx: number = 4500;
  interLastIdx: number = 4500;
  diffLastIdx: number = 4500;

  getLastIdx() {
    this.afd.object('statistics').subscribe(stats => {
      this.easyLastIdx = stats["easyQuestNum"];
      this.interLastIdx = stats["interQuestNum"];
      this.diffLastIdx = stats["diffQuestNum"];
    });
  }


  moveToResultPage() {
    this.navCtrl.setRoot(SpeedResultPage, {
      answerArr: this.userAnswerArr,
      questions: this.questions,
      type: 'speed-test'

    });
  }

  replaceNumbers(s: string) {
    s = String(s);
    s = s.replace(/١/gi, '1');
    s = s.replace(/٢/gi, '2');
    s = s.replace(/٣/gi, '3');
    s = s.replace(/٤/gi, '4');
    s = s.replace(/٥/gi, '5');
    s = s.replace(/٦/gi, '6');
    s = s.replace(/٧/gi, '7');
    s = s.replace(/٨/gi, '8');
    s = s.replace(/٩/gi, '9');
    s = s.replace(/٠/gi, '0');
    return s;
  }

  replaceAleph(s: string) {
    s = String(s);
    s = s.replace(/أ/gi, 'ا');
    s = s.replace(/إ/gi, 'ا');
    s = s.replace(/آ/gi, 'ا');
    s = s.replace(/ء/gi, 'ا');
    s = s.replace(/ئ/gi, 'ا');
    s = s.replace(/ى/gi, 'ا');
    return s;
  }
}
