import { Category } from './../../shared/models/question';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';

@Injectable()
export class CategoryProvider {

  cats$: FirebaseListObservable<Category[]>;
  cats: Array<Category> = [];

  constructor(public afd: AngularFireDatabase) {
    this.cats$ = this.afd.list('categories');
    this.getCategories();
  }

  getCatByKey(key: string): any {
    let catBub = null;
    for (let cat of this.cats) {
      if (cat.$key === key) {
        catBub = cat;
        // console.log(catBub);
      }
    }
    return catBub;
  }
  getCategories(): Promise<any> {

    return new Promise((resolve, reject) => {
      let categoryArr = [];
      this.cats$.subscribe(categoryList => {
        categoryList.forEach(category => {
          categoryArr.push(category);
        });
      });
      this.cats = categoryArr;
      resolve();
    });
  }

  getCats(query = {}): FirebaseListObservable<Category[]> {
    if (query) {
      this.cats$ = this.afd.list('categories', {
        query: query
      });
    }
    return this.cats$;
  }

  removeCat(qKey: string) {
    if (qKey) {
      this.cats$.remove(qKey).then(
        _ => { console.log('Category added'); console.log('Category removed'); }
      ).
        catch(error => console.log(error));
    }
  }

  addCat(q: Category) {
    this.cats$.push(q).
      then(_ => { console.log('Category added'); });
  }

  updateCat(q) {
    this.cats$.update(q.$key, q).
      then(_ => { console.log('Category edited'); });
  }

  getParentCat(cat, categories): Category {
    for (let c of categories) {
      if (c.$key === cat.parentKey) {
        return c;
      }
    }
    return null;
  }

  isRootCat(key) {
    let cat = this.getCatByKey(key);
    return !cat.hasParent
  }

  getCatDisplayName(key: string): string {
    let cat = this.getCatByKey(key);
    if (cat !== null) {
      return cat.displayName
    }
    return null;
  }
  getCatDisplayNameArabic(key: string): string {
    let cat = this.getCatByKey(key);
    if (cat !== null) {
      return cat.displayNameArabic;
    }
    return null;
  }
  catHasParent(key: string): boolean {
    let cat = this.getCatByKey(key);
    if (cat !== null) {
      return cat.hasParent
    }
    return false;
  }

  getSubCats(key) {
    let cats = [];
    for (let c of this.cats) {
      if (c.parentKey === key) {
        cats.push(c);
      }
    }
    return cats;
  }

  changeQuestionNumber(catKey, decrease = false) {
    let catBuff;
    new Promise((resolve, reject) => {
      console.log(catKey);
      let cat$ = this.afd.object('/categories/' + catKey);
      cat$.subscribe(cat => {
        if (cat.questionNumber) {
          if (decrease) {
            cat.questionNumber = cat.questionNumber - 1;
          } else {
            cat.questionNumber = cat.questionNumber + 1;
          }
        } else {
          if (decrease) {
            cat.questionNumber = 0;
          } else {
            cat.questionNumber = 1;
          }
        }
        catBuff = cat;
        resolve();
      });
    }).then(_ => {
      if (catBuff.$key) {
        this.afd.list('categories/').update(catKey, catBuff).
          then(_ => {
            console.log('Cat question number is updated');
            console.log(catBuff);
          });
      }
    });
  }
}
