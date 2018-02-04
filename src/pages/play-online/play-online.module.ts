import { ProgressBarComponent } from './../../components/progress-bar/progress-bar';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayOnlinePage } from './play-online';
import { QuestionBarComponent } from '../../components/question-bar/question-bar';
// import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    PlayOnlinePage,
    // ProgressBarComponent, 
    // QuestionBarComponent
  ],
  imports: [
    IonicPageModule.forChild(PlayOnlinePage),
    // ComponentsModule
  ],
})
export class PlayOnlinePageModule {}
