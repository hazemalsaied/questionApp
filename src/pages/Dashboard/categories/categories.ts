import { AddCategoryPage } from './../add-category/add-category';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Category } from '../../../shared/models/question';
import { CategoryProvider } from '../../../providers/category/category'
// import { FirebaseListObservable } from 'angularfire2/database-deprecated';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {

  categories$: FirebaseListObservable<Category[]>;
  categories: Array<Category> = [];
  allCategories: Array<Category> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public catProvider: CategoryProvider,
    public alertCtrl: AlertController) {

    this.categories$ = catProvider.getCats(
      // { equalTo: { value: 'hasParent', key: false } }
      // { orderByValue: 'hasParent', equalTo: false }
    );
    this.categories = this.getCats();
    this.allCategories = this.getCats();
  }

  getCats() {
    let categoryArr = [];
    this.categories$.subscribe(categoryList => {
      categoryList.forEach(category => {
        category.showMe = false;
        categoryArr.push(category);
      });
    });
    return categoryArr;
  }

  gatChildCats(cat) {
    let subCats = [];
    for (let c of this.allCategories) {
      if (c.hasParent && c.parentKey === cat.$key) {
        subCats.push(c);
      }
    }
    return subCats;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CategoriesPage');
  }

  filterCats(ev: any) {
    let query = ev.target.value;
    if (query !== null && query.trim()) {
      this.categories$ = this.catProvider.getCats();
      this.categories = this.getCats();
      this.categories = this.categories.filter((c) => {
        if (c.displayName && query) {
          let inDisplayName: boolean = c.displayName.toLowerCase().indexOf(query.toLowerCase()) > -1;
          if (inDisplayName) {
            return true;
          }
          let inDisplayNameArabic: boolean = c.displayNameArabic.toLowerCase().indexOf(query.toLowerCase()) > -1;
          if (inDisplayNameArabic) {
            return true;
          }
          return false;
        }
      });
    } else {
      this.categories = this.getCats();
    }
  }

  removeCategory(key) {
    console.log(key);
    let alert = this.alertCtrl.create({
      title: 'هل تريد حذف التبويب؟',
      buttons: [
        {
          text: 'إلغاء',
          handler: data => { }
        }, {
          text: 'حذف',
          handler: data => {
            this.catProvider.removeCat(key);
            this.categories = this.getCats();
          }
        }
      ]
    });
    alert.present();
  }
  editCategory(cat) {
    this.navCtrl.push(AddCategoryPage, {
      cat: cat
    });

  }
  getParentCatDisplayName(cat) {
    let parentCat = this.catProvider.getParentCat(cat, this.allCategories);
    if (parentCat !== null) {
      return parentCat.displayName;
    }
    return '';
  }

  showPanel(cat) {
    cat.showMe = !cat.showMe;
  }

  openPage(page) {
    this.navCtrl.push(page);
  }
}
