import { ProgressBarComponent } from './../../components/progress-bar/progress-bar';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SpeedTestPage } from './speed-test';
import { QuestionBarComponent } from '../../components/question-bar/question-bar';

@NgModule({
  declarations: [
    SpeedTestPage,
    // ProgressBarComponent,
    // QuestionBarComponent
  ],
  imports: [
    IonicPageModule.forChild(SpeedTestPage),
  ],
})
export class SpeedTestPageModule {}
