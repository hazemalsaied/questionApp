import { Component, Input } from '@angular/core';
// import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'question-bar-3',
  templateUrl: 'question-bar-3.html'
})
export class QuestionBar3Component {

  @Input('answerArr') answerArr;

  constructor() {
  }

}