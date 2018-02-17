import { Component, Input } from '@angular/core';
// import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'question-bar-2',
  templateUrl: 'question-bar-2.html'
})
export class QuestionBar2Component {

  @Input('answerArr') answerArr;

  constructor() {
  }

}