import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SpeedTestPage } from './speed-test';
import { QuestionBar1Component } from '../../../components/question-bar.1/question-bar-1';
import { ProgressBar1Component } from './../../../components/progress-bar.1/progress-bar-1';
@NgModule({
  declarations: [
    SpeedTestPage,
    ProgressBar1Component,
    QuestionBar1Component],
  imports: [
    IonicPageModule.forChild(SpeedTestPage)
  ],
  exports: []
})
export class SpeedTestPageModule { }
