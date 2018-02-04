import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayPage } from './play';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar';
import { QuestionBarComponent } from '../../components/question-bar/question-bar';
// import { ComponentsModule } from '../../components/components.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [
    PlayPage,
    ProgressBarComponent,
    QuestionBarComponent
  ],
  imports: [
    IonicPageModule.forChild(PlayPage),
    // ComponentsModule
  ],
  schemas: [
    // NO_ERRORS_SCHEMA,
    // CUSTOM_ELEMENTS_SCHEMA
    ]
  
})
export class PlayPageModule {}
