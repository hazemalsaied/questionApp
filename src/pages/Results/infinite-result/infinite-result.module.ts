import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfiniteResultPage } from './infinite-result';

@NgModule({
  declarations: [
    InfiniteResultPage,
  ],
  imports: [
    IonicPageModule.forChild(InfiniteResultPage),
  ],
})
export class InfiniteResultPageModule {}
