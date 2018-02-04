import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Category } from '../../../shared/models/question';
import { CategoryProvider } from '../../../providers/category/category'
import { FirebaseListObservable } from 'angularfire2/database-deprecated';


@IonicPage()
@Component({
  selector: 'page-add-category',
  templateUrl: 'add-category.html',
})
export class AddCategoryPage {
  isChildPage: boolean = false;
  categories$: FirebaseListObservable<Category[]>;
  categories: Array<Category> = [];

  category: Category = {
    displayName: 'New category',
    displayNameArabic: 'تصنيف جديد',
    alias: 'new-category',
    hasParent: false,
    parentKey: '',
    showMe: false,
    showSubCats: false,
    questionNumber: 0
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public catProvider: CategoryProvider) {

    if (navParams.get('cat')) {
      this.category = navParams.get('cat');
      this.isChildPage = true;
    }
    this.categories$ = catProvider.getCats(
    );
    this.categories = this.getCats();

  }

  getCats() {
    let categoryArr = [];
    this.categories$.subscribe(categoryList => {
      categoryList.forEach(category => {
        categoryArr.push(category);
      });
    });
    return categoryArr;
  }

  ionViewDidLoad() {
  }

  addCategory() {
    this.category.showMe = null;
    this.category.alias = this.category.displayName.toLowerCase().replace(' ', '-');
    if (typeof this.category.$key === 'undefined' || !this.category.$key) {
      this.catProvider.addCat(this.category);
    } else {
      this.catProvider.updateCat(this.category);
    }
    if (this.isChildPage) {
      this.navCtrl.pop();
    }
  }

  catSelected(cat) {
    this.category.hasParent = true;
    this.category.parentKey = cat.$key;

  }

  getCaptions() {
    if (this.category.$key) {
      return 'تحرير التبويب';
    }
    return 'إضافة تبويب';
  }
}
