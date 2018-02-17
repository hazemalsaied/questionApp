import { Component, Input } from '@angular/core';
// import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'progress-bar-2',
  templateUrl: 'progress-bar-2.html'
})
export class ProgressBar2Component {

  @Input('progress') progress;
  @Input('text') text;
  @Input('showProgress') showProgress = true;
  @Input('isQuestionContent') isQuestionContent = false;

  progressInnerClass = 'progress-inner';
  constructor() {
    if (this.isQuestionContent){
      this.progressInnerClass = 'red-progress-inner';
    }
  }

}