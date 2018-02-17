import { Component, Input } from '@angular/core';
// import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'question-bar-1',
  templateUrl: 'question-bar-1.html'
})
export class QuestionBar1Component {

  @Input('answerArr') answerArr;

  constructor() {
  }

}