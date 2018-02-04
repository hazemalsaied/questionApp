import { Component, Input } from '@angular/core';
// import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'question-bar',
  templateUrl: 'question-bar.html'
})
export class QuestionBarComponent {

  @Input('answerArr') answerArr;

  constructor() {
  }

}