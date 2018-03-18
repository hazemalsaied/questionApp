import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayPage } from './play';
import { ProgressBarComponent } from '../../../components/progress-bar/progress-bar';
import { QuestionBarComponent } from './../../../components/question-bar/question-bar';


@NgModule({
  declarations: [
    PlayPage,
    ProgressBarComponent,
    QuestionBarComponent
  ],
  imports: [
    IonicPageModule.forChild(PlayPage),
  ],
  schemas: []

})
export class PlayPageModule { }
