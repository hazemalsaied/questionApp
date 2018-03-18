import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportedQuestionsPage } from './reported-questions';

@NgModule({
  declarations: [
    ReportedQuestionsPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportedQuestionsPage),
  ],
})
export class ReportedQuestionsPageModule {}
