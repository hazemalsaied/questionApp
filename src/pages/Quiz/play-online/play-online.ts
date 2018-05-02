import { Question } from './../../../shared/models/question';
import { QuizQuestionsPage } from './../../Results/quiz-questions/quiz-questions';
import { AdMobFreeProvider } from './../../../providers/admonfree/admobfree';
import { UserProvider } from './../../../providers/user/user';
import { QuestionProvider } from './../../../providers/question/question';
import { Quiz } from './../../../shared/models/quiz';
import { User } from './../../../shared/models/user';
import { Settings } from './../../../shared/settings/settings';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { Component } from '@angular/core';
import { NavController, IonicPage, ToastController, AlertController } from 'ionic-angular';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

import { CategoryProvider } from './../../../providers/category/category';
import firebase from 'firebase';
import { Category } from '../../../shared/models/question';
import { ResultsPage } from '../../Results/results/results';
import { AngularFireDatabase } from 'angularfire2/database-deprecated';


@IonicPage()
@Component({
  selector: 'page-play-online',
  templateUrl: 'play-online.html',
})
export class PlayOnlinePage {

  mainCats: Array<Category> = [];


  choiceClass = {};
  btnsClass = Settings.btnsClass;
  contentClass = Settings.contentAnimClass;
  jokerClass = Settings.jokerFixClass;
  stormClass = Settings.stormFixClass;
  hammarClass = Settings.hammarFixClass;
  questionIdx: number = -1;

  progressValue: number = 0;
  questions: Array<Question> = [Settings.emptyQuestion];
  currentQuestion = Settings.emptyQuestion;
  questionImageUrl = '';

  currentChoices = [];
  choiceBkgs = {};

  selectedSubCat: string = '';

  currentUser: User = Settings.emptyUser;
  partner: User = Settings.emptyUser;


  userAnswer: string = ''
  hasAnswered: boolean = false;

  showQuiz: boolean = false;
  showStormBtn: boolean = false;
  showCats: boolean = true;
  showUsers: boolean = false;


  showWaitingPanel = false;
  showUserCards = false;

  isInterrupted = false;

  waitListInterval;
  waitExpireTimeOut;

  isSearching = false;
  isPlaying = false;
  isLoading = false;
  isCreator = false;

  constructor(public navCtrl: NavController,
    public afd: AngularFireDatabase,
    public toasCtrl: ToastController,
    public catProvider: CategoryProvider,
    public questionP: QuestionProvider,
    public userP: UserProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public admob: AdMobFreeProvider) {

    this.userP.removeQuiz();
    console.log('previous quiz removed!')


    this.initQuizPage();

    this.catProvider.getAllCats().then(allCats => {
      this.mainCats = this.catProvider.getMainCats(allCats);
      this.catProvider.getAllSubCats();
    });
  }
  initQuizPage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userP.getUser().then(us => {
        if(us!=null && us.quiz ==null){
          this.currentUser = us;
          resolve();
        }
        else if (us != null) {
          this.currentUser = us;
          this.currentUser.quiz = null;
          this.currentUser.userAnswers = null;
          this.currentUser.trueAnswers = 0;
          this.currentUser.falseAnswers = 0;
          this.currentUser.usedJockers = 0;
          this.currentUser.usedStorms = 0;
          this.currentUser.usedHammars = 0;
          this.currentUser.interrupted = false;
          this.afd.list('userProfile').update(this.currentUser.$key, this.currentUser).then(_ => {
            console.log('user initialised');
            resolve();
          });
        }
      });
    });
  }

  ionViewWillLeave() {
    if (this.isSearching) {
      console.log('ionViewWillLeave while searching');
      clearInterval(this.waitListInterval);
      this.removefromWaitingList(this.currentUser.$key);
    } else if (this.isPlaying || this.isLoading) {
      console.log('ionViewWillLeave while loading');
      this.currentUser.interrupted = true;
      this.afd.list('userProfile').update(this.currentUser.$key, this.currentUser);
      if (this.isPlaying) {
        clearInterval(this.progressInterval);
      }
    }
    console.log('ionViewWillLeave peacefully');
  }


  ionViewCanLeave() {

    // if (this.isSearching || this.isLoading || this.isPlaying) {
    //   console.log('ionViewCanLeave while playing');
    //   let alert = this.alertCtrl.create({
    //     title: 'لا يمكنك العودة إلى هذا الكويز في حال المغادرة، متابعة؟',
    //     buttons: [
    //       {
    //         text: 'إلغاء',
    //         handler: data => { }
    //       }, {
    //         text: 'متابعة',
    //         handler: data => {
    //           // TODO
    //         }
    //       }
    //     ]
    //   });
    //   alert.present();

    // } else {
    //   console.log('ionViewCanLeave peacefully');
    // }
  }

  waitOrFindAPartner(catKey) {
    this.initQuizPage().then(_ => {
      this.selectedSubCat = catKey;
      this.showCats = false;
      this.showWaitingPanel = true;
      this.isSearching = true;
      this.findPartner().then(partnerAlias => {
        if (partnerAlias == null) {
          this.noPartnerYet()
        } else {
          this.prepareQuiz(partnerAlias);
        }
      });
    });
  }

  noPartnerYet() {
    this.addToWaitingList().then(_ => {
      this.waitListInterval = setInterval(() => {
        this.checkForPartner();
      }, Settings.waitingListStep);
      this.waitExpireTimeOut = setTimeout(() => {
        this.noPartnerFound();
      }, Settings.playOnlineExpireInterval);
    });
  }

  checkForPartner() {
    console.log('checking For a Partner');
    this.userP.getUser().then(us => {
      this.currentUser = us;
      if (us.quiz != null) {
        this.isSearching = false;
        console.log('Partner found!')
        clearInterval(this.waitListInterval);
        clearTimeout(this.waitExpireTimeOut);
        this.loadQuiz();
      }
    });
  }

  noPartnerFound() {
    console.log('no Partner Found');
    if (this.currentUser.quiz == null) {
      this.userP.getUser().then(us => {
        this.currentUser = us;
        if (this.currentUser.quiz == null) {
          clearInterval(this.waitListInterval);
          this.isSearching = false;
          this.showToast('ما من لاعبين لهذا التبويب في هذه اللحظات! حاول لاحقا!');
          this.removefromWaitingList(this.currentUser.$key).then(_ => {
            this.selectedSubCat = '';
            this.showWaitingPanel = false;
            this.showCats = true;
            this.showQuiz = false;
          });
        }
      });
    }
  }

  loadQuiz() {
    console.log('Loading the quiz');
    this.isSearching = false;
    this.isLoading = true;
    this.afd.object('quiz/' + this.currentUser.quiz).subscribe(q => {
      this.questions = q.questions;
      this.userP.getUserByKey(q.oddUser).then(us => {
        this.partner = us;
      });
      this.startQuiz();
    });
  }

  prepareQuiz(partnerAlias) {
    console.log('Prepare the quiz');
    this.isCreator = true;
    this.isSearching = false;
    this.isLoading = true;
    this.removefromWaitingList(partnerAlias.user);
    this.createQuiz(partnerAlias).then(quiz => {
      this.userP.addQuiz(this.currentUser, quiz.$key);
      this.userP.getUserByKey(partnerAlias.user).then(partnerUser => {
        this.userP.addQuiz(partnerUser, quiz.$key).then(_ => {
          this.questions = quiz.questions;
          this.partner = partnerUser;
          setTimeout(() => {
            this.startQuiz();
          }, 1000);
        });
      });
    });
  }

  createQuiz(partnerAlias): Promise<any> {
    console.log('Creating the quiz');
    return new Promise((resolve, reject) => {
      this.questionP.getPlayQuestions(this.selectedSubCat).then(qs => {
        this.questions = qs;
        this.afd.list('quiz/').push({ questions: qs, evenUser: partnerAlias.user, oddUser: this.currentUser.$key }).then(quizRef => {
          this.afd.object('quiz/' + quizRef.key).subscribe(quiz => {
            resolve(quiz);
          });
        });
      });
    });
  }
  shouldInterruptInterval = null;

  startQuiz() {
    console.log('Quiz started');
    this.showWaitingPanel = false;
    this.showUserCards = true;
    this.shouldInterruptInterval = setInterval(() => {
      this.shouldInterrupt();
    }, 20000);
    setTimeout(() => {
      this.isLoading = false;
      this.isPlaying = true;
      this.showUserCards = false;
      this.getNextQuestion();
      this.showQuiz = true;
      this.showUsers = true;
    }, Settings.playOnlineUserCardWaitingInterval);
  }

  findPartner(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.list('waitingList/' + this.selectedSubCat).subscribe(partnerAliass => {
        // if (partnerAliass != null && partnerAliass.length > 0) {
        //   resolve(partnerAliass[0]);
        // } else {
        //   resolve(null);
        // }
        partnerAliass.forEach(alias => {
          if (alias.date != null) {
            var diff = new Date().getTime() - alias.date;
            var diffMin = diff / (1000 * 60);
            if (diffMin > 2) {
              console.log('Partners cleaned');
              this.removefromWaitingList(alias.user);
            } else if (alias.user != this.currentUser.$key) {
              console.log('Partner found');
              resolve(alias);
            }
          }
        });
        resolve(null);
      });
    });
  }

  addToWaitingList(): Promise<any> {
    console.log('added to waiting list!');
    var currentdate = new Date();
    return new Promise((resolve, reject) => {
      this.afd.list('waitingList/' + this.selectedSubCat).push({ user: this.currentUser.$key, date: String(new Date().getTime()) }).then(_ => {
        resolve(_);
      });
    });
  }

  removefromWaitingList(userKey) {
    console.log('Removed from waiting list!');
    return new Promise((resolve, reject) => {
      this.afd.list('waitingList/' + this.selectedSubCat, { query: { orderByChild: 'user', equalTo: userKey, limitToFirst: 1 } }).subscribe(partnerList => {
        if (partnerList != null && partnerList.length > 0) {
          this.afd.list('waitingList/' + this.selectedSubCat).remove(partnerList[0].$key).then(_ => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  progressInterval;

  increaseProgress(interval) {
    if (this.progressValue < 100) {
      this.progressValue += 5;
    } else if (this.progressValue >= 100) {
      clearInterval(this.progressInterval);
      if (!this.hasAnswered) {
        this.hasAnswered = true;
        this.updateUserAnswers(false);

      }
    }
  }

  updateUserAnswers(value) {
    console.log('updateUserAnswers!');
    if (this.currentUser.userAnswers != null) {
      this.currentUser.userAnswers.push(value);
    } else {
      this.currentUser.userAnswers = [value];
    }
    if (value) {
      this.currentUser.trueAnswers = this.currentUser.trueAnswers + 1;
    } else { this.currentUser.falseAnswers = this.currentUser.falseAnswers + 1; }
    this.afd.list('userProfile').update(this.currentUser.$key, this.currentUser);
  }

  nextBtn(choice) {
    console.log('Next is clicked!');
    if (this.progressValue < 100) {
      this.hasAnswered = true;
      clearInterval(this.progressInterval);
    }
    this.selectChoiceBtn(choice);
    this.validate();
    setTimeout(() => {
      this.questionImageUrl = '';
    }, Settings.waitingTime * 0.7);
    setTimeout(() => {
      this.getNextQuestion();
    }, Settings.waitingTime);
  }

  updatePartner(): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('Update the partner!');
      this.userP.getUserByKey(this.partner.$key).then(u => {
        this.partner = u;
        if (this.partner.interrupted) {
          this.showQuiz = false;
          this.isInterrupted = true;
          clearInterval(this.progressInterval);
          clearInterval(this.waitingPartnerAnswerInterval);
          clearInterval(this.shouldInterruptInterval);
        }
        resolve();
      });
    });

  }
  validate() {
    this.contentClass = Settings.contentFixClass;
    this.btnsClass = Settings.btnsClass;
    if (!this.timeRespected()) {
      console.log('Time not respected!');
      return;
    }
    this.isValidAnswer();
  }

  isValidAnswer() {
    clearInterval(this.progressInterval);
    let userAnswerTmp = this.userAnswer;
    let answerTmp = Settings.replaceNumbers(this.currentQuestion.answer);
    answerTmp = Settings.replaceAleph(answerTmp);
    if ((this.currentQuestion.answerType.toLocaleLowerCase() === 'fillblanck') ||
      (this.currentQuestion.answerType.toLocaleLowerCase() === 'multiplechoices')) {
      userAnswerTmp = Settings.replaceNumbers(this.userAnswer);
      userAnswerTmp = Settings.replaceAleph(userAnswerTmp);
    }
    this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
    this.choiceClass[this.currentQuestion.answer] = Settings.validAnswer;
    if (userAnswerTmp.toLocaleLowerCase() === answerTmp.toLocaleLowerCase()) {
      this.questionP.playMusic();
      this.choiceBkgs['fillBlank'] = Settings.validColor;
      this.choiceClass['fillBlank'] = Settings.validAnswer;
      this.updateUserAnswers(true);
    } else {
      this.questionP.playMusic('false');
      this.updateUserAnswers(false);
      this.choiceBkgs[this.userAnswer] = Settings.dangerColor;
      this.choiceClass[this.userAnswer] = Settings.nonValidAnswer;
      this.choiceBkgs['fillBlank'] = Settings.dangerColor;
      this.choiceClass['fillBlank'] = Settings.nonValidAnswer;
    }
  }

  waitingPartnerAnswerInterval = null;
  waitingPartnerLoader;
  waitingPartnerLoaded = false;
  goldenLoader;
  goldenLoaded = false;

  getNextQuestion() {
    this.updatePartner().then(_ => {
      if (!this.isInterrupted) {
        this.nextQuestion();
        this.shouldWaitPartner();
        this.shouldEnd();
      }
    });
  }

  shouldInterrupt() {
    if (this.waitingPartnerTime != null) {
      let currrentTime = new Date().getTime();
      var diff = new Date().getTime() - this.waitingPartnerTime;
      if (diff / (1000 * 60) > 2) {
        this.waitingPartnerTime = null;
        clearInterval(this.progressInterval);
        clearInterval(this.shouldInterruptInterval);
        this.showQuiz = false;
        this.isInterrupted = true;
      }
    }
  }
  nextQuestion() {
    if (this.isLegalQuestion() ||
      (!this.isLegalQuestion() && this.haveSameQuestionNum() && this.isEqual()) ||
      (!this.isLegalQuestion() &&
        this.currentUser.trueAnswers + this.currentUser.falseAnswers <
        this.partner.trueAnswers + this.partner.falseAnswers)) {
      if (this.waitingPartnerAnswerInterval != null) {
        if (this.waitingPartnerLoaded) {
          this.waitingPartnerLoaded = false;
          this.waitingPartnerLoader.dismiss();
        }
        console.log('loading.dismiss');
        clearInterval(this.waitingPartnerAnswerInterval);
        this.waitingPartnerAnswerInterval = null;
        this.waitingPartnerTime = null;
      }
      if (!this.isLegalQuestion()) {
        this.goldenLoader = this.loadingCtrl.create({
          content: 'جاري تحميل سؤال ذهبي!',
          enableBackdropDismiss: true
        });
        this.goldenLoader.present();
        this.goldenLoaded = true;
        setTimeout(() => {
          if (this.goldenLoaded) {
            this.goldenLoaded = false;
            this.goldenLoader.dismiss();
          }
          this.prepareQuestion();
        }, 1500);
      } else {
        this.prepareQuestion();
      }
      console.log('Loading the next question!');
    }
  }

  waitingPartnerTime = null;

  shouldWaitPartner() {
    console.log('shouldWaitPartner');
    if ((this.questionIdx >= Settings.onlineQuestionNum - 1 && this.hasAnswered) &&
      this.currentUser.trueAnswers + this.currentUser.falseAnswers >
      this.partner.trueAnswers + this.partner.falseAnswers) {
      if (this.waitingPartnerAnswerInterval == null) {
        this.waitingPartnerLoader = this.loadingCtrl.create({
          content: 'في انتظار جواب الخصم!',
          enableBackdropDismiss: true
        });
        this.waitingPartnerLoader.present();
        this.waitingPartnerLoaded = true;
        console.log('Waiting for partner reponse!');
        this.waitingPartnerAnswerInterval = setInterval(() => {
          this.waitingPartnerTime = new Date().getTime();
          this.getNextQuestion();
        }, 3000);
      }
    }
  }

  shouldEnd() {
    if (!this.isLegalQuestion() && this.haveSameQuestionNum() && !this.isEqual()) {
      console.log('the quiz should end!');
      if (this.waitingPartnerAnswerInterval != null) {
        if (this.waitingPartnerLoaded) {
          this.waitingPartnerLoader.dismiss();
          console.log('loading.dismiss');
        }
        clearInterval(this.waitingPartnerAnswerInterval);
        this.waitingPartnerAnswerInterval = null;
        this.waitingPartnerTime = null;
      }
      this.endQuiz();
    }
  }

  prepareQuestion() {
    if (this.questions != null && this.questionIdx < this.questions.length) {
      this.questionImageUrl = '';
      this.animate();
      this.questionIdx += 1;
      console.log('questionIdx', this.questionIdx)
      this.currentQuestion = this.questions[this.questionIdx];
      this.questionImageUrl = Settings.imageBeg + this.currentQuestion.imageUrl + Settings.imageEnd;
      this.resetQuestion();
      this.currentChoices = this.getChoices();
      this.shouldShowStorm();
      this.runProgressBar();
    }
  }

  animate() {
    this.contentClass = Settings.contentAnimClass;
    this.btnsClass = Settings.btnsAnimClass;
    this.jokerClass = Settings.jokerFixClass;
    this.stormClass = Settings.stormFixClass;
    this.hammarClass = Settings.hammarFixClass;
  }

  timeRespected() {
    if (this.progressValue >= 100) {
      if (!this.hasAnswered) {
        this.currentUser.userAnswers.push(false);
      }
      return false;
    }
    this.hasAnswered = true;
    this.progressValue = 100;
    return true;
  }

  hasFinished = false;

  endQuiz() {
    if (this.currentUser.trueAnswers > this.partner.trueAnswers) {
      this.hasWon = true;
    }
    console.log('Quiz ended!');
    this.admob.launchInterstitial(this.currentUser).then(_ => {
      clearInterval(this.shouldInterruptInterval);
      this.showQuiz = false;
      this.hasFinished = true;
      if (this.hasWon) {
        if (this.currentUser.pointNum != null) {
          this.currentUser.pointNum += 150;
        } else {
          this.currentUser.pointNum = 150;
        }
        if (this.currentUser.goldenPoints != null) {
          this.currentUser.goldenPoints += 150;
        } else {
          this.currentUser.goldenPoints = 150;
        }
      }

      this.isPlaying = false;
    });
  }

  runProgressBar() {
    this.progressValue = 0;
    this.progressInterval = setInterval(() => {
      this.increaseProgress(this.progressInterval)
    }, Settings.progressBarSep);
  }


  selectChoiceBtn(choice) {
    this.userAnswer = choice;
    this.setDefaultColor();
    this.choiceBkgs[choice] = Settings.activeChoiceColor;
    this.choiceClass[this.currentQuestion.answer] = Settings.selectedAnimAnswer;
    this.choiceClass[choice] = Settings.selectedAnimAnswer;
    this.choiceClass['fillBlank'] = Settings.selectedAnimAnswer;
  }

  shouldShowStorm() {
    if (this.currentQuestion.answerType.toLocaleLowerCase() === 'trueorfalse' ||
      this.currentQuestion.answerType.toLocaleLowerCase() === 'fillblanck') {
      this.showStormBtn = false;
    } else {
      this.showStormBtn = true;
    }
  }

  resetQuestion() {
    this.setDefaultColor();
    this.hasAnswered = false;
    this.progressValue = 0;
    this.userAnswer = '';
  }

  useJoker() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.jokerNum > 0) {
      this.currentUser.usedJockers = this.currentUser.usedJockers + 1;
      clearInterval(this.progressInterval);
      this.questionP.playMusic('jocker');
      this.jokerClass = Settings.jokerAnimClass;
      this.progressValue = 100;
      this.userP.updateScores(this.currentUser, 'joker').then(_ => {
        this.updateUserAnswers(true);
        this.hasAnswered = true;
        this.choiceBkgs['fillBlank'] = Settings.validColor;
        this.choiceClass['fillBlank'] = Settings.validAnswer;
        this.userAnswer = this.currentQuestion.answer
        this.choiceBkgs[this.currentQuestion.answer] = Settings.validColor;
        this.choiceClass[this.currentQuestion.answer] = Settings.validAnswer;
        setTimeout(() => {
          this.questionImageUrl = '';
        }, Settings.waitingTime * 0.7);
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
      this.currentUser.usedHammars = this.currentUser.usedHammars + 1;
      clearInterval(this.progressInterval);
      this.questionP.playMusic('hammar');
      this.hammarClass = Settings.hammarAnimClass;
      let loading = this.loadingCtrl.create({
        content: 'جاري تحميل سؤال بديل'
      });
      loading.present();
      this.questionImageUrl = '';
      this.userP.updateScores(this.currentUser, 'hammar').then(_ => {
        this.questions.splice(this.questionIdx, 1);
        this.questionIdx -= 1;
        loading.dismiss();
        this.getNextQuestion();
      });
    } else {
      this.questionP.showToast('لا يمكنك استخدام المطرقة!', this.toasCtrl);
    }
  }

  useStorm() {
    if (!this.hasAnswered && this.progressValue < 100 && this.currentUser.stormNum > 0) {
      this.currentUser.usedStorms = this.currentUser.usedStorms + 1;
      this.questionP.playMusic('storm');
      this.stormClass = Settings.stormAnimClass;
      this.userP.updateScores(this.currentUser, 'storm').then(_ => {
        let deletedItems = 0;
        while (true) {
          let idx = Math.floor(Math.random() * 4);
          if (idx < this.currentChoices.length && !this.currentChoices[idx].isTrue) {
            this.currentChoices.splice(idx, 1);
            deletedItems += 1;
          }
          if (deletedItems === 2) {
            // this.resetQuestion();
            break;
          }
        }
      });
    } else {
      this.questionP.showToast('لا يمكنك استخدام العاصفة!', this.toasCtrl);
    }
  }

  sadFaceImageUrl = Settings.sadface;
  happyFaceImageUrl = Settings.happyFace;

  hasWon = false;
  currentUserTrueAnswers = 0;
  currentUserFalseAnswers = 0;
  partnerTrueAnswers = 0;
  partnerFalseAnswers = 0;


  haveSameQuestionNum(): boolean {
    if (this.currentUser.trueAnswers + this.currentUser.falseAnswers ==
      this.partner.trueAnswers + this.partner.falseAnswers) {
      return true;
    }
    return false;
  }


  shouldWait(): boolean {
    if (this.questionIdx > Settings.onlineQuestionNum - 1 &&
      this.currentUser.trueAnswers + this.currentUser.falseAnswers ==
      this.partner.trueAnswers + this.partner.falseAnswers) {
      return false;
    } else {
      return true;
    }
  }
  isLegalQuestion() {
    if (this.questionIdx < Settings.onlineQuestionNum - 1) {
      return true;
    }
    return false;
  }
  isEqual() {
    if (this.currentUser.trueAnswers === this.partner.trueAnswers) {
      return true;
    }
    return false;
  }

  getResultScores() {
    this.currentUserTrueAnswers = 0;
    this.currentUserFalseAnswers = 0;
    this.partnerTrueAnswers = 0;
    this.partnerFalseAnswers = 0;
    for (let a of this.currentUser.userAnswers) {
      if (a === true) {
        this.currentUserTrueAnswers += 1;
      } else if (a === false) {
        this.currentUserFalseAnswers += 1;
      }
    }
    if (this.partner.userAnswers != null)
      for (let a of this.partner.userAnswers) {
        if (a === true) {
          this.partnerTrueAnswers += 1;
        } else if (a === false) {
          this.partnerFalseAnswers += 1;
        }
      }
  }

  getChoices() {
    let q = this.currentQuestion;
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
      this.choiceClass['true'] = Settings.fixAnswer;
      this.choiceClass['false'] = Settings.fixAnswer;
    } else if (this.currentQuestion.answerType.toLocaleLowerCase() === 'fillblanck') {
      this.choiceBkgs['fillBlank'] = Settings.choiceColor;
      this.choiceClass['fillBlank'] = Settings.fixAnswer;
    }
    else {
      for (let c of this.currentQuestion.choices) {
        this.choiceBkgs[c.text] = Settings.choiceColor;
        this.choiceClass[c.text] = Settings.fixAnswer;
      }
      this.choiceBkgs[this.currentQuestion.answer] = Settings.choiceColor;
      this.choiceClass[this.currentQuestion.answer] = Settings.fixAnswer;
    }
  }

  showQuestions() {
    let qs = [];
    let idx = 0;
    for (let q of this.questions) {
      if (idx <= this.questionIdx) {
        qs.push(q)
      } else { break; }
      idx += 1;
    }
    this.navCtrl.push(QuizQuestionsPage,
      { questions: qs });
  }
  playOnline() {
    this.navCtrl.setRoot(PlayOnlinePage);
  }
  showToast(message: string) {
    const toast = this.toasCtrl.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });
    toast.onDidDismiss(this.dismissHandler);
    toast.present();
  }

  dismissHandler() {

  }
}
