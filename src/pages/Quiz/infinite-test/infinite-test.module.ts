import { ProgressBar2Component } from './../../../components/progress-bar.2/progress-bar-2';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfiniteTestPage } from './infinite-test';
import { QuestionBar2Component } from '../../../components/question-bar.2/question-bar-2';

@NgModule({
  declarations: [
    InfiniteTestPage,
    ProgressBar2Component,
    QuestionBar2Component
  ],
  imports: [
    IonicPageModule.forChild(InfiniteTestPage),
  ],
})
export class InfiniteTestPageModule {}
