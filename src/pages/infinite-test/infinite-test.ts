import { Settings } from './../../shared/settings/settings';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

import { QuestionProvider } from '../../providers/question/question';
import { CategoryProvider } from './../../providers/category/category';
import firebase from 'firebase';
import { Question, Category } from '../../shared/models/question';
import { ResultsPage } from '../results/results';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';

@IonicPage()
@Component({
  selector: 'page-infinite-test',
  templateUrl: 'infinite-test.html',
})
export class InfiniteTestPage {

  public backgroundImage: any = "./assets/bg7.jpeg";
  public backgroundImageForImage: any = "./assets/bg6.png";
  public imageBeg = Settings.imageBeg;
  public imageEnd = Settings.imageEnd;

  questionIdx: number = -1;

  userPoints = 0;
  progressValue: number = 0;
  loadingValue: number = 0;

  questions: Array<Question> = [];
  categories$: FirebaseListObservable<Category[]>;

  currentChoices = [];
  choiceBkgs = {};

  quizType: string = 'all';
  selectedCat: string = '';
  selectedSubCat: string = '';

  loadingBarText: string = ''

  userAnswer: string = ''
  hasAnswered: boolean = false;
  catSelects = [];
  userAnswerArr = [];
  subCatSelects = [];

  showAll: boolean = false;
  showQuiz: boolean = true;
  showCatSelect: boolean = false;
  showSubCatSelect: boolean = false;
  showLoadingBar: boolean = true;
  showStormBtn: boolean = false;


  currentQuestion: Question = {
    content: '',
    cats: [{ key: '' }],
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
    DiffIdx: '',
    DiffCatIdx: '',
    DiffSubCatIdx: ''
  };

  constructor(public navCtrl: NavController,
    public afd: AngularFireDatabase,
    public questionProv: QuestionProvider,
    public catProvider: CategoryProvider,
    public loadingCtrl: LoadingController) {

    this.getCompetitionQuestions();
  }

  getCompetitionQuestions() {
    let loading = this.loadingCtrl.create({
      content: 'جاري تحميل الكويز'
    });
    loading.present();
    let questionArr = []
    new Promise((resolve, reject) => {
      this.getRef("1").on("value", function (snapshot) {
        snapshot.forEach(function (child) {
          questionArr.push(child.val());
          return false;
        });
        resolve();
      });
    }).then(_ => {
      new Promise((resolve, reject) => {
        this.getRef("2").on("value", function (snapshot) {
          snapshot.forEach(function (child) {
            questionArr.push(child.val());
            return false;
          });
          resolve();
        });
      }).then(_ => {
        new Promise((resolve, reject) => {
          this.getRef("3").on("value", function (snapshot) {
            snapshot.forEach(function (child) {
              questionArr.push(child.val());
              return false;
            });
            resolve();
          });
        }).then(_ => {
          this.userAnswerArr = this.getQuestionIdxArr();
          this.showQuiz = true;
          this.questions = questionArr;
          this.getNextQuestion();
          this.loadQuestion();
          loading.dismiss();
          this.showAll = true;
        });
      });
    });
  }

  getRef(diff, oneQuestion = false) {
    let randomNum1 = Math.floor((Math.random() * 100) + 1);
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
    return firebase.database().ref("questions").orderByChild(field).
      startAt(diff + catInfo + randomNum1.toString()).
      limitToFirst(questionNum);
  }


  loadingInterval;
  progressInterval;

  loadQuestion() {
    this.loadingValue = 0;
    this.progressValue = 0;
    this.showLoadingBar = true;
    this.loadingBarText = this.currentQuestion.content;
    this.loadingInterval = setInterval(() => {
      if (this.loadingValue < 100) {
        this.loadingValue = this.loadingValue + 10;
      } else if (this.loadingValue === 100) {
        this.showLoadingBar = false;
        this.progressInterval = setInterval(() => {
          this.increaseProgress(this.progressInterval)
        }, Settings.progressBarSep);
        clearInterval(this.loadingInterval);
      }
    }, Settings.loadingStep);
  }

  increaseProgress(interval) {
    if (this.progressValue < 100) {
      this.progressValue += 5;
    } else if (this.progressValue == 100) {
      if (!this.hasAnswered) {
        this.userAnswerArr[this.questionIdx] = 'false';
      }
      clearInterval(this.progressValue);
    }
  }

  terminateQuestionPanel() {
    this.progressValue = 100;
    if (this.questionIdx === Settings.questionNum - 1) {
      setTimeout(() => {
        this.navCtrl.setRoot(ResultsPage, {
          answerArr: this.userAnswerArr,
          userPoints: this.userPoints
        });
      }, Settings.waitingTime);
    }
  }

  initializeQuestionPanel() {
    this.setDefaultColor();
    this.hasAnswered = false;
    this.progressValue = 0;
    this.userAnswer = '';
  }

  next(choice) {
    this.selectChoice(choice);
    clearInterval(this.loadingInterval);
    clearInterval(this.progressInterval);
    if (this.progressValue < 100) {
      this.validate();
    }
    setTimeout(() => {
      this.showLoadingBar = true;
      this.loadingValue = 0;
      this.initializeQuestionPanel();
      this.getNextQuestion();
      this.loadQuestion();
    }, Settings.waitingTime);
  }

  getNextQuestion() {
    if (this.questionIdx < (this.questions.length - 1)) {
      this.questionIdx += 1;
      this.currentQuestion = this.questions[this.questionIdx];
      this.currentChoices = this.getChoices(this.currentQuestion);
      if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse') {
        this.showStormBtn = false;
      } else {
        this.showStormBtn = true;
      }
    }
  }

  validate() {
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
    this.terminateQuestionPanel();
  }

  useJoker() {
    if (this.progressValue < 100) {
      clearInterval(this.loadingInterval);
      clearInterval(this.progressInterval);
      this.userPoints = this.userPoints - Settings.jokerPoints;
      this.userPoints += Settings.questionPoint;
      this.userAnswerArr[this.questionIdx] = 'true';
      this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
      this.terminateQuestionPanel();
      setTimeout(() => {
        this.showLoadingBar = true;
        this.loadingValue = 0;
        this.initializeQuestionPanel();
        this.getNextQuestion();
        this.loadQuestion();
      }, Settings.waitingTime);
    }
  }

  useHammer() {
    if (this.progressValue < 100) {
      clearInterval(this.loadingInterval);
      clearInterval(this.progressInterval);
      let loading = this.loadingCtrl.create({
        content: 'جاري تحميل سؤال بديل'
      });
      loading.present();
      this.userPoints = this.userPoints - Settings.hammerPoints;
      let randomNum1 = Math.floor((Math.random() * 1000) + 1);
      let ref = this.getRef(this.currentQuestion.difficulty, true);
      let ques;
      new Promise((resolve, reject) => {
        ref.on("value", function (snapshot) {
          snapshot.forEach(function (child) {
            ques = child.val();
            return false;
          });
          resolve();
        });
      }).then(_ => {
        this.questions.push(ques);
        this.questions.splice(this.questionIdx, 1);
        this.questionIdx -= 1;
        this.showLoadingBar = true;
        this.loadingValue = 0;
        this.initializeQuestionPanel();
        this.getNextQuestion();
        this.loadQuestion();
        loading.dismiss();
      });
    }
  }

  useStorm() {
    if (this.progressValue < 100) {
      this.userPoints = this.userPoints - Settings.stormPoints;
      let deletedItems = 0;
      while (true) {
        let idx = Math.floor(Math.random() * 4);
        if (idx < this.currentChoices.length && !this.currentChoices[idx].isTrue) {
          this.currentChoices.splice(idx, 1);
          deletedItems += 1;
        }
        if (deletedItems === 2) {
          this.initializeQuestionPanel();
          break;
        }
      }
    }
  }

  getQuestionIdxArr() {
    var list = [];
    for (var i = 0; i < Settings.questionNum; i++) {
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

  setSettingVis() {
    this.showQuiz = !this.showQuiz;
    if (!this.showQuiz) {
      this.categories$ = this.catProvider.getCats();
    }
  }

  hideSelects() {
    this.showCatSelect = false;
    this.showSubCatSelect = false;
  }

  showCatSelects() {
    this.showCatSelect = true;
    this.showSubCatSelect = false;
    this.getCats();
  }

  showSubCatSelects(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCats().then(_ => {
        this.showCatSelect = true;
        this.selectedCat = this.catSelects[0].value;
        this.getSubCats().then(_ => {
          this.showSubCatSelect = true;
          if (this.subCatSelects.length > 0) {
            this.selectedSubCat = this.subCatSelects[0].value;
          }
        });
      });
      resolve();
    });
  }

  getCats(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.catSelects.length === 0) {
        this.categories$.subscribe(cats => {
          cats.forEach(cat => {
            if (!cat.hasParent) {
              this.catSelects.push({ value: cat.$key, name: cat.displayNameArabic });
            }
          });
          this.selectedCat = this.catSelects[0].value;
          resolve();
        });
      }
    });
  }

  getSubCats() {
    return new Promise((resolve, reject) => {
      this.subCatSelects = [];
      this.categories$.subscribe(cats => {
        cats.forEach(cat => {
          if (cat.hasParent && cat.parentKey === this.selectedCat) {
            this.subCatSelects.push({ value: cat.$key, name: cat.displayNameArabic });
          }
        });
        resolve();
      });
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
