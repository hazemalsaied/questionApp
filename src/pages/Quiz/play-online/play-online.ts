import { UserProvider } from './../../../providers/user/user';
import { QuestionProvider } from './../../../providers/question/question';
import { Quiz } from './../../../shared/models/quiz';
import { User } from './../../../shared/models/user';
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


@IonicPage()
@Component({
  selector: 'page-play-online',
  templateUrl: 'play-online.html',
})
export class PlayOnlinePage {


  public imageBeg = Settings.imageBeg;
  public imageEnd = Settings.imageEnd;
  searchingImg = "./assets/searching.png";
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

  currentUser: User =Settings.emptyUser;
  partner: User = Settings.emptyUser;

  quiz;

  userAnswer: string = ''
  hasAnswered: boolean = false;
  catSelects = [];
  userAnswerArr = [];
  subCatSelects = [];

  showQuiz: boolean = false;
  showCatSelect: boolean = false;
  showSubCatSelect: boolean = false;
  showStormBtn: boolean = false;
  showCats: boolean = true;

  currentQuestion: Question = Settings.emptyQuestion;

  showWaitingPanel = false;
  showQuizStart = false;

  userImageUrl = "./assets/profile.png";
  partnerImageUrl = "./assets/profile.png";

  isOddUser: boolean = false;
  oddUserAnswers = [];
  evenUserAnswers = [];

  oddUser: User = Settings.emptyUser;
  evenUser: User = Settings.emptyUser;

  constructor(public navCtrl: NavController,
    public afd: AngularFireDatabase,
    public toasCtrl: ToastController,
    public catProvider: CategoryProvider,
    public loadingCtrl: LoadingController,
    public questionP: QuestionProvider,
    public userP: UserProvider) {
      let loading = this.loadingCtrl.create({
        content: 'جاري تهيئة الكويز'
      }); 
      loading.present();
      this.userP.getUser().then(us => {
        this.currentUser = us;

        this.catProvider.getAllCats().then(allCats => {
          this.allCats = allCats;
          this.mainCats = this.catProvider.getMainCats(allCats);
          loading.dismiss();
  
        });
      });

    // this.getAllCats().then(_ => {
    //   this.getMainCats();
    // });
    // this.userP.getUser().then(us => {
    //   this.currentUser = us;
    // });
    //this.userP.removeQuiz(); 
  }

  // getQuizInfo() {
  //   let catKey = '';
  //   let isSubCat = false;
  //   let isCat = false;
  //   if (this.selectedSubCat != null && this.selectedSubCat != '') {
  //     catKey = this.selectedSubCat;
  //     isSubCat = true;
  //   } else if (this.selectedCat != null && this.selectedCat != '') {
  //     catKey = this.selectedCat;
  //     isCat = true;
  //   }
  //   return {
  //     catKey: catKey,
  //     isSubCat: isSubCat,
  //     isCat: isCat
  //   }
  // }

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
      }, Settings.imageQuestionInterval);
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
      setTimeout(() => {
        this.navCtrl.setRoot(ResultsPage, {
          answerArr: this.userAnswerArr,
          userPoints: this.userPoints,
          questions: this.questions,
          type: 'play-online'
        });
      }, Settings.waitingTime);
    }
  }

  resetQuestion() {
    this.setDefaultColor();
    this.hasAnswered = false;
    this.progressValue = 0;
    this.userAnswer = '';
  }

  nextBtn(choice) {
    clearInterval(this.progressInterval);
    this.selectChoiceBtn(choice);
    this.validate();
    setTimeout(() => {
      this.getNextQuestion();
    }, Settings.waitingTime);
  }

  getNextQuestion() {
    this.resetQuestion();
    if (this.questionIdx < (this.questions.length - 1)) {
      this.questionIdx += 1;
      this.currentQuestion = this.questions[this.questionIdx];
      this.currentChoices = this.getChoices(this.currentQuestion);
      if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse') {
        this.showStormBtn = false;
      } else {
        this.showStormBtn = true;
      }
      this.loadQuestion();
    }
  }

  validate() {
    if (this.progressValue > 100) {
      if (this.isOddUser) {
        this.currentQuestion.oddUserAnswer = '';
      } else {
        this.currentQuestion.evenUserAnswer = '';
      }
      this.updateQuiz();
      return;
    }
    if (this.isOddUser) {
      this.currentQuestion.oddUserAnswer = this.userAnswer;
    } else {
      this.currentQuestion.evenUserAnswer = this.userAnswer;
    }
    this.updateQuiz().then(_ => {
      // this.quiz = qz;
      this.updateUserAnswer();
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
        this.trueAnswers +=1;
      } else {
        this.userAnswerArr[this.questionIdx] = 'false';
        this.falseAnswers += 1;
        this.choiceBkgs[this.userAnswer] = Settings.dangerColor;
      }
      // if(this.isOddUser){
      //   this.quiz.oddUserAnwers = this.userAnswer;
      // }else{
      //   this.quiz.evenUserAnwers = this.userAnswer;
      // }
      this.endQuiz();
    });
  }

  getQuiz(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.object('quiz/' + this.currentUser.quiz).subscribe(qz => {
        this.quiz = qz;
        resolve(qz);
      });
    });
  }

  updateQuiz(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.list('quiz/' + this.currentUser.quiz).update(this.quiz.$key, this.quiz).then(qz => {
        this.quiz = qz;
        resolve();
      })
    });
  }

  updateUserAnswer() {
    this.oddUserAnswers = [];
    this.evenUserAnswers = [];
    for (let i = 0; i < this.questions.length; i++) {
      if (this.questions[i].oddUserAnswer != null) {
        if (this.questions[i].oddUserAnswer == this.questions[i].answer) {
          this.oddUserAnswers.push(true);
        } else {
          this.oddUserAnswers.push(false);
        }
      } else {
        this.oddUserAnswers.push(null);
      }
      if (this.questions[i].evenUserAnswer != null) {
        if (this.questions[i].evenUserAnswer == this.questions[i].answer) {
          this.evenUserAnswers.push(true);
        } else {
          this.evenUserAnswers.push(false);
        }
      } else {
        this.evenUserAnswers.push(null);
      }
    }
  }

  // useJoker() {
  //   if (this.progressValue < 100) {
  //     clearInterval(this.progressInterval);
  //     this.userPoints = this.userPoints - Settings.jokerPoints;
  //     this.userPoints += Settings.questionPoint;
  //     this.userAnswerArr[this.questionIdx] = 'true';
  //     this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
  //     this.endQuiz();
  //     setTimeout(() => {
  //       this.getNextQuestion();
  //     }, Settings.waitingTime);
  //   }
  // }

  // useHammer() {
  //   if (this.progressValue < 100) {
  //     clearInterval(this.progressInterval);
  //     let loading = this.loadingCtrl.create({
  //       content: 'جاري تحميل سؤال بديل'
  //     });
  //     loading.present();
  //     this.userPoints = this.userPoints - Settings.hammerPoints;
  //     // let quizInfo = this.getQuizInfo();
  //     let ques;
  //     new Promise((resolve, reject) => {
  //       this.questionP.getRef(this.currentQuestion.difficulty, this.selectedSubCat, 1).subscribe(questions => {
  //         questions.forEach(function (child) {
  //           ques = child;
  //           return false;
  //         });
  //       });
  //     }).then(_ => {
  //       this.questions.push(ques);
  //       this.questions.splice(this.questionIdx, 1);
  //       this.questionIdx -= 1;

  //       this.getNextQuestion();
  //       loading.dismiss();
  //     });
  //   }
  // }

  // useStorm() {
  //   if (this.progressValue < 100) {
  //     this.userPoints = this.userPoints - Settings.stormPoints;
  //     let deletedItems = 0;
  //     while (true) {
  //       let idx = Math.floor(Math.random() * 4);
  //       if (idx < this.currentChoices.length && !this.currentChoices[idx].isTrue) {
  //         this.currentChoices.splice(idx, 1);
  //         deletedItems += 1;
  //       }
  //       if (deletedItems === 2) {
  //         this.resetQuestion();
  //         break;
  //       }
  //     }
  //   }
  // }

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
          this.resetQuestion();
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
          this.resetQuestion();
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
            this.resetQuestion();
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

  selectChoiceBtn(choice) {
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

  selectedCatBfr = null;
  waitListInterval;

  changeSubCatVis(catKey) {
    this.mainCats.forEach(cat => {
      cat.showMe = false;
      if (cat.$key === catKey) {
        cat.showMe = true;
        this.getSubCats(catKey);
      }
    });
  }

  waitOrFindAPartner(catKey) {
    this.selectedSubCat = catKey;
    this.userP.getUser().then(user => {
      this.currentUser = user;
      this.findPartner(catKey).then(partnerAlias => {
        this.showCats = false;
        if (partnerAlias == null) {
          this.showWaitingPanel = true;
          console.log('No partner found!')
          this.addToWaitingList(catKey, user.$key).then(_ => {
            this.waitListInterval = setInterval(() => {
              this.checkForPartner(user, catKey);
            }, Settings.waitingListStep);
          });
        } else {
          this.isOddUser = true;
          this.showWaitingPanel = false;
          this.initQuiz(partnerAlias, user, catKey);
        }
      });
    });
  }

  findPartner(catKey): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.list('waitingList/' + catKey, { query: { limitToLast: 1 } }).subscribe(partnerAliass => {
        if (partnerAliass != null && partnerAliass.length > 0) {
          //@TODO VERIFY IF IT IS YOU
          resolve(partnerAliass[0]);
        } else { resolve(null); }
      });
    });
  }


  initQuiz(partnerAlias, user, catKey) {
    this.createQuiz(user, partnerAlias).then(quiz => {
      this.userP.addQuiz(user, quiz.$key).then(_ => {
        this.userP.getUserByKey(partnerAlias.user).then(partnerUser => {
          this.partner = partnerUser;
          console.log('partnerUser', partnerUser);
          this.userP.addQuiz(partnerUser, quiz.$key).then(_ => {
            this.oddUser = this.currentUser;
            this.evenUser = partnerUser;
            this.showWaitingPanel = false;
            this.showQuizStart = true;
            this.quiz = quiz;
            this.questions = quiz.questions;
            this.removePartner(catKey, partnerAlias.user).then(_ => {
              setTimeout(() => {
                this.questions = quiz.questions;
                this.showQuizStart = false;
                this.showQuiz = true;
                this.getNextQuestion();
              }, Settings.playOnlineUserCardWaitingInterval);
            });
          });
        });
      });
    });
  }

  checkForPartner(user, catKey) {
    this.userP.getUser().then(us => {
      if (us.quiz != null) {
        clearInterval(this.waitListInterval);
        this.afd.object('quiz/' + us.quiz).subscribe(q => {
          this.showWaitingPanel = false;
          this.showQuizStart = true;
          this.userP.getUserByKey(q.oddUser.key).then(us => {
            this.oddUser = us;
          });
          this.evenUser = this.currentUser;
          setTimeout(() => {
            this.questions = q.questions;
            this.showQuizStart = false;
            this.showQuiz = true;
            this.getNextQuestion();
          }, 5000);
        });
      }
    });
  }


  runQuiz(q: Quiz) {
    this.questions = q.questions;
    this.currentQuestion = this.questions[this.questionIdx];
    this.showQuizStart = false;
  }

  createQuiz(user, partnerAlias): Promise<any> {
    return new Promise((resolve, reject) => {
      // let quizInfo = this.getQuizInfo();
      this.questionP.getPlayQuestions(this.selectedSubCat).then(qs => {
        for (let q of qs) {
          q.evenUserHammer = false;
          q.evenUserJoker = false;
          q.evenUserStorm = false;
          q.oddUserHammer = false;
          q.oddUserJoker = false;
          q.oddUserStorm = false;
          q.evenUserAnswer = null;
          q.oddUserAnswer = null;
        }
        this.afd.list('quiz/').push(
          {
            evenUser: { key: user.$key, points: 0 },
            oddUser: { key: partnerAlias.user, points: 0 },
            questions: qs,
          }).then(quizRef => {
            console.log(quizRef.key);
            this.afd.object('quiz/' + quizRef.key).subscribe(quiz => {
              this.quiz = quiz;
              this.questions = this.quiz.questions;
              console.log('quiz : ', quiz);
              resolve(quiz);
            });

          });
      });
    });
  }


  addToWaitingList(catKey, userKey): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.list('waitingList/' + catKey).push({ user: userKey }).then(_ => {
        resolve(_);
      });
    });
  }

  removePartner(catKey, partnerKey) {
    return new Promise((resolve, reject) => {
      this.afd.list('waitingList/' + catKey, { query: { orderByChild: 'user', equalTo: partnerKey, limitToFirst: 1 } }).subscribe(partnerList => {
        if (partnerList != null && partnerList.length > 0) {
          console.log(partnerList[0].$key);
          this.afd.object('waitingList/' + catKey + '/' + partnerList[0].$key).remove().then(_ => {
            console.log('Partner was deleted!');
            resolve();
          });
        }
      });
    });
  }



  // selectSubCat(cat) {
  //   this.selectedCat = '';
  //   this.selectedSubCat = cat.$key;
  //   this.getCompetitionQuestions();
  // }
  // selectCat(cat) {
  //   if (cat == null) {
  //     this.selectedCat = '';
  //     this.selectedSubCat = '';
  //     this.getCompetitionQuestions();
  //   } else if (this.selectedCat == cat.$key) {
  //     this.getCompetitionQuestions();
  //   } else {
  //     this.selectedSubCat = '';
  //     this.selectedCat = cat.$key;
  //     for (let c of this.mainCats) {
  //       c.showMe = false;
  //     }
  //     cat.showMe = true;
  //     this.getSubCats(cat.$key);
  //   }
  // }

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
