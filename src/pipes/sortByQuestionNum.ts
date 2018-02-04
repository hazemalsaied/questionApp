import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SortQuestionNum',
  pure: false
})
export class SortQuestionNum implements PipeTransform {
  transform(array: Array<any>, args: string): any {
    if (!array || array === undefined || array.length === 0) return null;

    array.sort((a: any, b: any) => {
      if (a.questionNum < b.questionNum) {
        return -1;
      } else if (a.questionNum > b.questionNum) {
        return 1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
