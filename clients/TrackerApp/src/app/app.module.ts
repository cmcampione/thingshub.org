import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { OnsenModule } from 'ngx-onsenui';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AgmCoreModule } from '@agm/core';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { AccountService } from './account.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    OnsenModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD11pjYHyE0ekfygLBNJhvL1FgUp9-twkQ'
    })
  ],
  providers: [AccountService],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class AppModule { }
