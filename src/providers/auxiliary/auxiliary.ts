import { AngularFireDatabase } from 'angularfire2/database-deprecated';
import { QuestionProvider } from './../question/question';
import { CategoryProvider } from './../category/category';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { UserProvider } from '../user/user';

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

}
