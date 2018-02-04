import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { QuestionProvider } from './../question/question';
import { CategoryProvider } from './../category/category';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { UserProvider } from '../user/user';

/*
  Generated class for the AuxiliaryProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuxiliaryProvider {

  constructor(public userProv: UserProvider,
    public catProv: CategoryProvider,
    public questionProv: QuestionProvider,
    public afd: AngularFireDatabase) {
  }

  changeQuestionNumber(question, decrease = false) {
    this.userProv.changeQuestionNumber(question.user, decrease=decrease);
    this.catProv.changeQuestionNumber(question.cat, decrease=decrease);
    this.catProv.changeQuestionNumber(question.subCat, decrease=decrease);
    this.questionProv.changeQuestionNumber(decrease=decrease);

  }

  setInitialQuestionNumber() {
    this.userProv.setInitialQuestionNumber();
    this.questionProv.setInitialQuestionNumber();
    this.questionProv.setInitialQuestionNumber4Cat();

  }

  // setInitialQuestionNumber() {
    

  //   let categories$ = this.catProv.getCats();

  //   let categoryArr = [];
  //   categories$.subscribe(categoryList => {
  //     categoryList.forEach(category => {
  //       categoryArr.push(category);
  //     });
  //     for (let cat of categoryArr) {
  //       if (!cat.hasParent) {

  //         this.questionProv.getQuestions({ orderByChild: 'cat', equalTo: cat.$key }).subscribe(questionList => {
  //           this.questionStats.push({ cat: cat.displayNameArabic, questionNum: questionList.length, key: cat.$key });
  //         });
  //       }
  //     }
  //   });
  //   this.questionProv.getQuestions().subscribe(questions => {
  //     this.totalQuestionNum = questions.length;
  //   });
  // }

}
