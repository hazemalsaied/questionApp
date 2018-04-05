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
import { ResultsPage } from '../../Results/results/results';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { UserProvider } from '../../../providers/user/user';

@IonicPage()

@Component({
  selector: 'page-play',
  templateUrl: 'play.html'
})

export class PlayPage {

  public backgroundImage: any = "./assets/bg7.jpeg";
  public backgroundImageForImage: any = "./assets/bg6.png";
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
  trueAnswers = 0;
  falseAnswers = 0;


  userAnswer: string = ''
  hasAnswered: boolean = false;
  catSelects = [];
  userAnswerArr = [];
  subCatSelects = [];

  showAll: boolean = false;
  showQuiz: boolean = false;
  showCatSelect: boolean = false;
  showSubCatSelect: boolean = false;

  showStormBtn: boolean = false;


  currentQuestion: Question = Settings.emptyQuestion;
  currentUser: User = Settings.emptyUser;

  constructor(public navCtrl: NavController,
    public afd: AngularFireDatabase,
    public catProvider: CategoryProvider,
    public questionP: QuestionProvider,
    public userP: UserProvider,
    public loadingCtrl: LoadingController,
    public toasCtrl: ToastController) {

    let loading = this.loadingCtrl.create({
      content: 'جاري تهيئة الكويز'
    });
    loading.present();
    this.userP.getUser().then(us => {
      this.currentUser = us;
      this.showAll = true;
      this.catProvider.getAllCats().then(allCats => {
        this.mainCats = this.catProvider.getMainCats(allCats);
        loading.dismiss();

      });
    });
  }

  getCompetitionQuestions() {
    let loading = this.loadingCtrl.create({
      content: 'جاري تحميل الكويز'
    });
    loading.present();
    this.questionP.getRandomQuestions("1", this.selectedSubCat, Settings.easyQuestionNum).then(questions1 => {

      questions1.forEach(q => {
        this.questions.push(q);
      });
      this.questionP.getRandomQuestions("2", this.selectedSubCat, Settings.intermediateQuestionNum).then(questions2 => {

        questions2.forEach(q => {
          this.questions.push(q);
        });
        this.questionP.getRandomQuestions("3", this.selectedSubCat, Settings.difficultQuestionNum).then(questions3 => {
          questions3.forEach(q => {
            this.questions.push(q);
          });
          this.questions.push.apply(questions3);
          this.userAnswerArr = this.getQuestionIdxArr();
          this.showQuiz = true;
          this.getNextQuestion();
          this.loadQuestion();
          loading.dismiss();
          this.showAll = true;
        });
      });
    });
  }

  progressInterval;

  loadQuestion() {
    if (this.currentQuestion.imageUrl != '' &&
      this.currentQuestion.imageUrl != null &&
      typeof this.currentQuestion.imageUrl != 'undefined') {
      setTimeout(() => {
        this.progressValue = 0;
        this.progressInterval = setInterval(() => {
          this.increaseProgress(this.progressInterval)
        }, Settings.progressBarSep);
      }, Settings.waitingTime);
    } else {
      this.progressValue = 0;
      this.progressInterval = setInterval(() => {
        this.increaseProgress(this.progressInterval)
      }, Settings.progressBarSep);
    }
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

  endQuiz() {
    this.progressValue = 100;

    if (this.questionIdx === Settings.questionNum - 1) {

      if (this.trueAnswers >= 5) {
        this.userPoints = this.userP.brokePreviousScore(this.currentUser, Settings.playType, this.userPoints);
        this.userP.updateScores(this.currentUser, 'pointNum', this.userPoints, this.selectedSubCat, Settings.playType, this.trueAnswers);
      }
      setTimeout(() => { 
        this.navCtrl.setRoot(ResultsPage, {
          trueAnswers: this.trueAnswers,
          falseAnswers: this.trueAnswers,
          userPoints: this.userPoints,
          answerArr: this.userAnswerArr,
          questions: this.questions,
          cat: this.selectedSubCat,
          type: Settings.playType
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
    clearInterval(this.progressInterval);
    if (this.progressValue < 100) {
      this.validate();
    }
    setTimeout(() => {
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
      this.showStormBtn = true;
      if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse') {
        this.showStormBtn = false;
      }
    }
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
      this.falseAnswers += 1;
      this.choiceBkgs[this.userAnswer] = Settings.dangerColor;
    }
    this.endQuiz();
  }

  useJoker() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.jokerNum > 0) {
      clearInterval(this.progressInterval);
      this.userP.updateScores(this.currentUser, 'joker').then(_ => {
        this.userPoints += Settings.questionPoint;
        this.trueAnswers += 1;
        this.hasAnswered = true;
        this.currentQuestion.userChoice = this.currentQuestion.answer;
        this.userAnswerArr[this.questionIdx] = 'true';
        this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
        this.endQuiz();
        setTimeout(() => {
          this.initializeQuestionPanel();
          this.getNextQuestion();
          this.loadQuestion();
        }, Settings.waitingTime);
      });
    } else {
      this.questionP.showToast('لا يمكنك استخدام الجوكر!', this.toasCtrl);
    }
  }

  useHammer() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.hammarNum > 0) {
      clearInterval(this.progressInterval);
      let loading = this.loadingCtrl.create({
        content: 'جاري تحميل سؤال بديل'
      });
      loading.present();
      this.userP.updateScores(this.currentUser, 'hammar').then(_ => {
        let ref = this.questionP.getRef(this.currentQuestion.difficulty, this.selectedSubCat, 1)
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
          this.initializeQuestionPanel();
          this.getNextQuestion();
          this.loadQuestion();
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

  allCats: Array<Category> = [];
  mainCats: Array<Category> = [];
  subCats: Array<Category> = [];

  // getAllCats(): Promise<any> {
  //   let loading = this.loadingCtrl.create({
  //     content: 'جاري تحميل الكويز'
  //   });
  //   loading.present();
  //   return new Promise((resolve, reject) => {
  //     if (this.allCats.length === 0) {
  //       this.categories$.subscribe(cats => {
  //         cats.forEach(cat => {
  //           cat.showMe = false;
  //           this.allCats.push(cat);
  //         });
  //         loading.dismiss();
  //         resolve();
  //       });
  //     } else {
  //       loading.dismiss();
  //       resolve();
  //     }
  //   });
  // }



  selectSubCat(cat) {
    this.selectedCat = '';
    this.selectedSubCat = cat.$key;
    this.getCompetitionQuestions();
  }

  selectCat(cat) {
    // if (cat == null) {
    //   this.selectedCat = '';
    //   this.selectedSubCat = '';
    //   this.getCompetitionQuestions();
    // } else if (this.selectedCat == cat.$key) {
    //   this.getCompetitionQuestions();
    // } else {
    this.selectedSubCat = '';
    this.selectedCat = cat.$key;
    for (let c of this.mainCats) {
      c.showMe = false;
    }
    cat.showMe = true;
    this.subCats = this.catProvider.getSubCats(cat.$key);
    // }
  }
}
