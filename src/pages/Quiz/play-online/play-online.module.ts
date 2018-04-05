import { UserCardComponent } from './../../../components/user-card/user-card';
import { ProgressBar3Component } from './../../../components/progress-bar.3/progress-bar-3';
import { QuestionBar3Component } from '../../../components/question-bar.3/question-bar-3';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayOnlinePage } from './play-online';

@NgModule({
  declarations: [
    PlayOnlinePage,
    ProgressBar3Component,
    QuestionBar3Component,
    UserCardComponent
  ],
  imports: [
    IonicPageModule.forChild(PlayOnlinePage),
    // ComponentsModule
  ],
})
export class PlayOnlinePageModule {}
