import { NativeAudio } from '@ionic-native/native-audio';
import { User } from './../../shared/models/user';
import { Question } from './../../shared/models/question';
import { Settings } from './../../shared/settings/settings';
import { CategoryProvider } from './../category/category';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';

@Injectable()
export class QuestionProvider {

  questions$: FirebaseListObservable<Question[]>;

  constructor(public afd: AngularFireDatabase,
    private nativeAudio: NativeAudio,
    public catProv: CategoryProvider) {

    this.questions$ = this.afd.list('questions');
    // this.getIndices();
    // this.getLastIdx();
    if (this.indices == null) {
      this.getIndices().then(indices => {
        this.indices = indices;
      })
    }
  }

  // easyLastIdx: number = 4500;
  // interLastIdx: number = 4500;
  // diffLastIdx: number = 4500;

  indices = null;
  getIndices() {
    return new Promise((resolve, reject) => {
      this.afd.object('indices').subscribe(indices => {
        resolve(indices);
      });
    })

  }

  // getLastIdx() {
  //   this.afd.object('statistics').subscribe(stats => {
  //     this.easyLastIdx = stats["easyQuestNum"];
  //     this.interLastIdx = stats["interQuestNum"];
  //     this.diffLastIdx = stats["diffQuestNum"];
  //   });
  // }
  playMusic(type = 'true') {
    if (Settings.onDevice) {
      let preloadTitle = 'true';
      if (type === 'false') {
        preloadTitle = 'false';
      } else if (type === 'storm') {
        preloadTitle = 'storm';
      } else if (type === 'jocker') {
        preloadTitle = 'jocker';
      } else if (type === 'hammar') {
        preloadTitle = 'hammar';
      }
      this.nativeAudio.play(preloadTitle);
    }
  }

  getDiffLabel(diff) {
    let label = '';
    diff = Number(diff);
    if (diff == 1) {
      label = 'easy';
    } else if (diff == 2) {
      label = 'intermediate';
    } else if (diff == 3) {
      label = 'difficult';
    }
    return label;
  }
  getRef(diff, selectedSubCat, questionNum) {
    let highestValue = this.indices[selectedSubCat][this.getDiffLabel(diff)];
    let randomNum = parseInt(String(Math.random() * (highestValue - 1) + 1));

    return this.afd.list('/questions',
      {
        query: {
          orderByChild: 'DiffSubCatIdx',
          startAt: diff + selectedSubCat + randomNum.toString(),
          limitToFirst: questionNum
        }
      });
  }

  getRandomQuestions(diff, selectedSubCat, quesNum): Promise<Array<any>> {
    let questionArr = [];
    return new Promise((resolve, reject) => {
      let promises = [];
      for (let i = 0; i < quesNum; i++) {
        let p = new Promise((resolve, reject) => {
          this.getRef(diff, selectedSubCat, 1).subscribe(questions => {
            questions.forEach(function (child) {
              questionArr.push(child);
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
  getPlayQuestions(selectedSubCat): Promise<Array<Question>> {
    return new Promise((resolve, reject) => {
      let qs = [];
      this.getQuestionPromises("1", Settings.onlineEasyQuestionNum, selectedSubCat).then(questions1 => {
        questions1.forEach(q => {
          qs.push(q);
        });
        this.getQuestionPromises("2", Settings.onlineIntermediateQuestionNum, selectedSubCat).then(questions2 => {
          questions2.forEach(q => {
            qs.push(q);
          });
          this.getQuestionPromises("3", Settings.onlineDifficultQuestionNum, selectedSubCat).then(questions3 => {
            questions3.forEach(q => {
              qs.push(q);
            });
            this.getRandQuestionPromises(25, selectedSubCat).then(questions3 => {
              questions3.forEach(q => {
                qs.push(q);
              });
              resolve(qs);
            });
          });
        });
      });
    });
  }

  getQuestionPromises(diff, quesNum, selectedSubCat): Promise<Array<any>> {
    let questionArr = [];
    return new Promise((resolve, reject) => {
      let promises = [];
      for (let i = 0; i < quesNum; i++) {
        let p = new Promise((resolve, reject) => {
          this.getRef(diff, selectedSubCat, 1).subscribe(questions => {
            questions.forEach(function (child) {
              questionArr.push(child);
            });
            resolve();
          });
        });
        promises.push(p);
      }
      Promise.all(promises).then(function (values) {
        resolve(questionArr);
      });
    });
  }

  getRandQuestionPromises(quesNum, selectedSubCat): Promise<Array<any>> {
    let questionArr = [];
    return new Promise((resolve, reject) => {
      let promises = [];
      for (let i = 0; i < quesNum; i++) {
        let p = new Promise((resolve, reject) => {
          let diff = parseInt(String(Math.random() * (4 - 1) + 1));
          this.getRef(diff, selectedSubCat, 1).subscribe(questions => {
            questions.forEach(function (child) {
              questionArr.push(child);
            });
            resolve();
          });
        });
        promises.push(p);
      }
      Promise.all(promises).then(function (values) {
        resolve(questionArr);
      });
    });
  }


  // getRef(diff, quizInfo, oneQuestion = false): Promise<FirebaseListObservable<Question[]>> {
  //   return new Promise((resolve, reject) => {
  //     this.getStats().then(stats => {
  //       let randomNum;
  //       if (diff == "1") {
  //         randomNum = parseInt(String(Math.random() * (stats.easyQuestNum - 1) + 1));
  //       } else if (diff == "2") {
  //         randomNum = parseInt(String(Math.random() * (stats.interQuestNum - 1) + 1));
  //       } else if (diff == "3") {
  //         randomNum = parseInt(String(Math.random() * (stats.diffQuestNum - 1) + 1));
  //       }
  //       let catInfo = '';
  //       let field = 'DiffIdx';
  //       let questionNum = Settings.easyQuestionNum;
  //       if (quizInfo.isSubCat) {
  //         field = 'DiffSubCatIdx';
  //       }
  //       else if (quizInfo.isCat) {
  //         field = 'DiffCatIdx';
  //       }
  //       catInfo = quizInfo.catKey;
  //       if (oneQuestion) {
  //         questionNum = 1;
  //       } else if (diff == "2") {
  //         questionNum = Settings.intermediateQuestionNum;
  //       }
  //       else if (diff == "3") {
  //         questionNum = Settings.difficultQuestionNum;
  //       }

  //       let q = {
  //         orderByChild: field,
  //         startAt: diff + catInfo + randomNum.toString(),
  //         limitToFirst: questionNum
  //       };
  //       resolve(this.afd.list('/questions/', { query: q }));
  //     });
  //   });
  // }

  getStats(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afd.object('statistics').subscribe(stats => {
        resolve(stats);
      });
    });
  }

  setCats4AllQuestions() {
    let result = 0;
    this.afd.list('questions').subscribe(questionList => {
      questionList.forEach(question => {
        if (question.cat == null || question.subCat == null) {
          let updated = false;
          for (var i = 0; i < question.cats.length; i++) {
            let catAlias = question.cats[i];
            let cat = this.catProv.getCatByKey(catAlias.key);
            if (cat != null) {
              updated = true;
              if (cat.hasParent) {
                question.subCat = catAlias.key;
              } else {
                question.cat = catAlias.key;
              }
            }
          }
          if (updated) {
            this.questions$.update(question.$key, question).then(_ => {
              result += 1;
              console.log(question.$key + ' updated!');
            });
          }
        }
      });
      // console.log(result + ' questions were updated!');
    });
  }

  setCatTime4AllQuestions() {
    let result = 0;
    this.afd.list('questions').subscribe(questionList => {
      questionList.forEach(question => {
        if (question.cat_time == null || question.subCat_time == null) {
          let updated = false;
          // if (question.cat_time === '_' + question.time) {
          //   updated = true;
          //   question.user_time = question.user + '_' + question.time
          //   question.subCat_time = question.subCat + '_' + question.time;
          //   question.cat_time = question.cat + '_' + question.time;
          // }
          for (var i = 0; i < question.cats.length; i++) {
            let catAlias = question.cats[i];
            let cat = this.catProv.getCatByKey(catAlias.key);
            if (cat != null) {
              updated = true;
              question.user_time = question.user + '_' + question.time
              if (cat.hasParent) {
                question.subCat_time = catAlias.key + '_' + question.time;
              } else {
                question.cat_time = catAlias.key + '_' + question.time;
              }
            }
          }
          if (updated) {
            this.questions$.update(question.$key, question).then(_ => {
              result += 1;
              console.log(question.$key + ' updated!');
            });
          }
        }
      });
      console.log(result + ' questions were updated!');
    });
  }


  // updateQuestionCatStruture(q: Question) {
  //   if (q.cats != null) {
  //     for (var i = 0; i < q.cats.length; i++) {
  //       let catAlias = q.cats[i];
  //       let cat = this.catProv.getCatByKey(catAlias.key);
  //       if (cat !== null) {
  //         if (cat.hasParent) {
  //           q.subCat = catAlias.key;
  //         } else {
  //           q.cat = catAlias.key;
  //         }
  //       }
  //     }
  //   }
  //   return q;
  // }

  setUser4AllQuestions() {
    let result = 0;
    this.afd.list('questions').subscribe(questionList => {
      questionList.forEach(question => {
        // if (!question.user) {
        question.time = new Date().toISOString().slice(0, 16)
        // question.user = 'V451IIJ6oNdbPjlnOvVqEK2uUmD2';
        this.updateQuestion(question);
        result += 1;
        console.log(question.$key + ' updated!');
        // }
      });
    });
    console.log(result + ' questions updated!');
    return result;
  }
  getQuestionByUserKey(userKey: string) {
    let questions = []
    this.afd.list('questions').subscribe(questionList => {
      questionList.forEach(question => {
        if (question.user !== userKey) {
          questions.push(question);
        }
      });
    });
    return questions;
  }
  getQuestions(query = {}): FirebaseListObservable<any[]> {
    if (query) {
      this.questions$ = this.afd.list('questions', {
        query: query
      });
    }
    return this.questions$;
  }

  removeQuestion(question) {
    if (question.$key) {
      this.questions$.remove(question.$key).then(
        _ => {
          console.log('question removed');
        }
      ).
        catch(error => console.log(error));
    }
  }
  updateQuestion(q) {
    // console.log(q.$key);
    this.questions$.update(q.$key, q).
      then(_ => { console.log('Question edited'); });
  }

  addQuestion(q: Question) {
    this.questions$.push(q).
      then(_ => { console.log('Question Added'); console.log(q.$key); });
    // catch(error => console.log(error));
  }

  getLastIdxNumber() {
    new Promise((resolve, reject) => {
      this.afd.object('/statistics/lastIdx')
        .subscribe(lastIdx => {
          return lastIdx;
        });
      resolve();
    });
  }
  changeQuestionNumber(decrease = false) {
    let qNum = 0;
    new Promise((resolve, reject) => {
      this.afd.object('/statistics/')
        .subscribe(stats => {
          if (stats.questionNumber) {
            if (decrease) {
              qNum = stats.questionNumber - 1;
            } else {
              qNum = stats.questionNumber + 1;
            }
          } else {
            if (decrease) {
              qNum = 0;
            } else {
              qNum = 1;
            }
          }
          resolve();
        });
    }).then(_ => {
      if (qNum) {
        this.afd.object('statistics').update({ questionNumber: qNum });
        console.log(qNum)
      }
    });

  }

  setInitialQuestionNumber() {
    let totalQNum = 0;
    new Promise((resolve, reject) => {
      this.afd.list('/questions/')
        .subscribe(questions => {
          totalQNum = questions.length;
          resolve();
        });
    }).then(_ => {
      if (totalQNum) {
        this.afd.object('statistics').update({ questionNumber: totalQNum });
        console.log(totalQNum)
      }
    });


    this.afd.object('/statistics/')
      .subscribe(questionNumber => {
        this.getQuestions().subscribe(questions => {
          if (questionNumber) {
            this.afd.object('statistics').update({ questionNumber: questions.length });
          }
          return;
        });

      });
  }

  setInitialQuestionNumber4Cat() {

    this.afd.list('/categories/').subscribe(categoryList => {
      categoryList.forEach(category => {
        let orderBy = 'cat';
        if (category.hasParent) {
          orderBy = 'subCat';
        }
        this.getQuestions({ orderByChild: orderBy, equalTo: category.$key }).
          subscribe(questionList => {
            category.questionNubmer = null;
            category.questionNumber = questionList.length;
            category.questionNumer = null;
            this.afd.list('/categories/').update(category.$key, category);
            // console.log(category);
          });

      });
    });
  }

  addRandomIndices() {
    console.log('addRandomIndices!');
    let result = 0;
    this.afd.list('questions').subscribe(questionList => {
      questionList.forEach(question => {
        if (question.idx1) {
          result += 1;
        }
        else {
          let randomNum = Math.floor((Math.random() * 1000000) + 1);
          question.idx1 = String(randomNum) + '_' + question.cat + '_' + question.difficulty;
          question.idx2 = String(randomNum) + '_' + question.subCat + '_' + question.difficulty;
          new Promise((resolve, reject) => {
            this.questions$.update(question.$key, question);
            resolve();
          }).then(_ => {
            result += 1;
            console.log(result + 'question updated!');
          });
        }
      });
      console.log('Number of affected questions: ' + result);
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

  showToast(message: string, toastCtrl) {
    const toast = toastCtrl.create({
      message: message,
      position: 'bottom',
      duration: 2000
    });
    toast.onDidDismiss(this.dismissHandler);
    toast.present();
  }

  private dismissHandler() {
  }

}