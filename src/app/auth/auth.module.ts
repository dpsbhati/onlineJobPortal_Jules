import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NgxSpinnerModule
  ]
})
export class AuthModule { }
