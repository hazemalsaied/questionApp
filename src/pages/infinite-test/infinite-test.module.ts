import { ProgressBarComponent } from './../../components/progress-bar/progress-bar';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfiniteTestPage } from './infinite-test';
import { QuestionBarComponent } from '../../components/question-bar/question-bar';

@NgModule({
  declarations: [
    InfiniteTestPage,
    // ProgressBarComponent,
    // QuestionBarComponent
  ],
  imports: [
    IonicPageModule.forChild(InfiniteTestPage),
  ],
})
export class InfiniteTestPageModule {}
