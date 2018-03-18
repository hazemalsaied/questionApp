import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuizQuestionsPage } from './quiz-questions';

@NgModule({
  declarations: [
    QuizQuestionsPage,
  ],
  imports: [
    IonicPageModule.forChild(QuizQuestionsPage),
  ],
})
export class QuizQuestionsPageModule {}
