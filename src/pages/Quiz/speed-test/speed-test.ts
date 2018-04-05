import { User } from './../../../shared/models/user';
import { QuestionProvider } from './../../../providers/question/question';
import { Settings } from './../../../shared/settings/settings';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

import { CategoryProvider } from './../../../providers/category/category';
import firebase from 'firebase';
import { Question, Category } from '../../../shared/models/question';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { SpeedResultPage } from '../../Results/speed-result/speed-result';
import { UserProvider } from '../../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-speed-test',
  templateUrl: 'speed-test.html',
})
export class SpeedTestPage {

  public imageBeg = Settings.imageBeg;
  public imageEnd = Settings.imageEnd;

  trueAnswers = 0;
  falseAnswers = 0;

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

  currentQuestion: Question = Settings.emptyQuestion;
  currentUser: User = Settings.emptyUser;
  constructor(public navCtrl: NavController,
    public afd: AngularFireDatabase,
    public catProvider: CategoryProvider,
    public userP: UserProvider,
    public questionP: QuestionProvider,
    public loadingCtrl: LoadingController,
    public toasCtrl: ToastController) {

    let loading = this.loadingCtrl.create({
      content: 'جاري تهيئة الكويز'
    });
    loading.present();
    this.userP.getUser().then(us => {
      this.currentUser = us;
      this.catProvider.getAllCats().then(allCats => {
        this.mainCats = this.catProvider.getMainCats(allCats);
        loading.dismiss();

      });
    });
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

      if (this.currentQuestion.imageUrl != '' &&
        this.currentQuestion.imageUrl != null &&
        typeof this.currentQuestion.imageUrl != 'undefined') {
        this.progressValue -= 4;
      }

      this.currentChoices = this.getChoices(this.currentQuestion);
      this.showStormBtn = true;
      if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse') {
        this.showStormBtn = false;
      }
    }
  }

  nextBtn(choice) {
    this.selectChoice(choice);
    this.validate();
    setTimeout(() => {
      this.getNextQuestion();
    }, Settings.waitingTimeSpeed);
  }

  validate() {
    this.currentQuestion.userChoice = this.userAnswer;
    let userAnswerTmp = this.userAnswer;
    let answerTmp = this.questionP.replaceNumbers(this.currentQuestion.answer);
    answerTmp = this.questionP.replaceAleph(answerTmp);
    this.hasAnswered = true;
    if ((this.currentQuestion.answerType.toLocaleLowerCase() === 'fillblanck') ||
      (this.currentQuestion.answerType.toLocaleLowerCase() === 'multiplechoices')) {
      userAnswerTmp = this.questionP.replaceNumbers(this.userAnswer);
      userAnswerTmp = this.questionP.replaceAleph(userAnswerTmp);
    }

    this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
    if (userAnswerTmp.toLocaleLowerCase() === answerTmp.toLocaleLowerCase()) {
      this.userPoints += Settings.questionPoint;
      this.userAnswerArr[this.questionIdx] = 'true';
      this.trueAnswers += 1;
    } else {
      this.userAnswerArr[this.questionIdx] = 'false';
      this.falseAnswers += 1
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
          this.questionP.getRef(diff, this.selectedSubCat, 1).subscribe(questions => {
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

  // getRef(diff, oneQuestion = false) {
  //   let randomNum;
  //   if (diff == "1") {
  //     randomNum = parseInt(String(Math.random() * (this.easyLastIdx - 1) + 1));
  //   } else if (diff == "2") {
  //     randomNum = parseInt(String(Math.random() * (this.interLastIdx - 1) + 1));
  //   } else if (diff == "3") {
  //     randomNum = parseInt(String(Math.random() * (this.diffLastIdx - 1) + 1));
  //   }
  //   let catInfo = '';
  //   let field = 'DiffIdx';
  //   let questionNum = Settings.easyQuestionNum;
  //   if (this.selectedSubCat) {
  //     field = 'DiffSubCatIdx';
  //     catInfo = this.selectedSubCat;
  //   }
  //   else if (this.selectedCat) {
  //     field = 'DiffCatIdx';
  //     catInfo = this.selectedCat;
  //   }
  //   if (oneQuestion) {
  //     questionNum = 1;
  //   } else if (diff == "2") {
  //     questionNum = Settings.intermediateQuestionNum;
  //   }
  //   else if (diff == "3") {
  //     questionNum = Settings.difficultQuestionNum;
  //   }
  //   return this.afd.list('/questions',
  //     {
  //       query: {
  //         orderByChild: field,
  //         startAt: diff + catInfo + randomNum.toString(),
  //         limitToFirst: questionNum
  //       }
  //     });
  // }

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
      this.endQuiz();
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
      // } else if (this.selectedCat == cat.$key) {
      //   this.startQuiz();
    } else {
      this.selectedSubCat = '';
      this.selectedCat = cat.$key;
      for (let c of this.mainCats) {
        c.showMe = false;
      }
      cat.showMe = true;
      this.subCats = this.catProvider.getSubCats(cat.$key);
    }
  }

  // easyLastIdx: number = 4500;
  // interLastIdx: number = 4500;
  // diffLastIdx: number = 4500;

  // getLastIdx() {
  //   this.afd.object('statistics').subscribe(stats => {
  //     this.easyLastIdx = stats["easyQuestNum"];
  //     this.interLastIdx = stats["interQuestNum"];
  //     this.diffLastIdx = stats["diffQuestNum"];
  //   });
  // }


  endQuiz() {
    if (this.trueAnswers >= 5) {
      this.userPoints = this.userP.brokePreviousScore(this.currentUser,Settings.speedTestType,this.userPoints);
      // if (this.currentUser.speedTestScore != null && this.userPoints > this.currentUser.speedTestScore) {
      //   this.currentUser.speedTestScore = this.userPoints;
      //   this.userPoints += 50;
      // }
      this.userP.updateScores(
        this.currentUser, 'pointNum', this.userPoints,this.selectedSubCat, Settings.speedTestType, this.trueAnswers);

    }
    this.navCtrl.setRoot(SpeedResultPage, {
      userPoints: this.userPoints,
      trueAnswers:this.trueAnswers,
      falseAnswers: this.trueAnswers,
      answerArr: this.userAnswerArr,
      questions: this.questions,
      type: Settings.speedTestType

    });

  }

  useJoker() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.jokerNum > 0) {
      // clearInterval(this.progressInterval);
      this.userP.updateScores(this.currentUser, 'joker').then(_ => {
        this.userPoints += Settings.questionPoint;
        this.trueAnswers +=1;
        this.currentQuestion.userChoice = this.currentQuestion.answer;
        this.hasAnswered = true;
        this.userAnswerArr[this.questionIdx] = 'true';
        this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
        setTimeout(() => {
          this.getNextQuestion();
        }, Settings.waitingTime);
      });
    } else {
      this.questionP.showToast('لا يمكنك استخدام الجوكر!', this.toasCtrl);
    }
  }

  useHammar() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.hammarNum > 0) {
      // clearInterval(this.progressInterval);
      let loading = this.loadingCtrl.create({
        content: 'جاري تحميل سؤال بديل'
      });
      loading.present();
      this.userP.updateScores(this.currentUser, 'hammar').then(_ => {

        let ref = this.questionP.getRef(this.currentQuestion.difficulty, this.selectedSubCat, 1);
        let ques;
        new Promise((resolve, reject) => {
          ref.subscribe(questions => {
            questions.forEach(function (child) {
              ques = child;
              resolve();
            });
          });
        }).then(_ => {
          this.questions.push(ques);
          this.questions.splice(this.questionIdx, 1);
          this.questionIdx -= 1;
          this.getNextQuestion();
          loading.dismiss();
        });
      });

    } else {
      this.questionP.showToast('لا يمكنك استخدام المطرقة!', this.toasCtrl);
    }
  }

  useStorm() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.stormNum > 0) {
      this.userP.updateScores(this.currentUser, 'storm').then(_ => {

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
      });
    } else {
      this.questionP.showToast('لا يمكنك استخدام العاصفة!', this.toasCtrl);
    }
  }

}
