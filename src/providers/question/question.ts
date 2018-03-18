import { CategoryProvider } from './../category/category';
import { Injectable } from '@angular/core';


import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { Question } from '../../shared/models/question'

@Injectable()
export class QuestionProvider {

  questions$: FirebaseListObservable<Question[]>;

  constructor(public afd: AngularFireDatabase,
    public catProv: CategoryProvider) {

    this.questions$ = this.afd.list('questions');
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
}