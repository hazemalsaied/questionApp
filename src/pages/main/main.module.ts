import { MainSliderComponent } from './../../components/main-slider/main-slider';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MainPage } from './main';

@NgModule({
  declarations: [
    MainPage,
    MainSliderComponent
  ],
  imports: [
    IonicPageModule.forChild(MainPage)
  ],
})
export class MainPageModule {}
