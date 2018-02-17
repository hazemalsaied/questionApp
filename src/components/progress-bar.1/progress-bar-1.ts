import { Component, Input } from '@angular/core';
// import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'progress-bar-1',
  templateUrl: 'progress-bar-1.html'
})
export class ProgressBar1Component {

  @Input('progress') progress;
  @Input('text') text;
  @Input('showProgress') showProgress = true;
  @Input('isQuestionContent') isQuestionContent = false;

  progressInnerClass = 'progress-inner';
  constructor() {
    if (this.isQuestionContent){
      console.log('red progress inner');
      this.progressInnerClass = 'red-progress-inner';
    }
  }

}