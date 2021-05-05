import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AgmCoreModule } from '@agm/core';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { ThingsComponent } from './things/things.component';
import { Sensors0Component } from './sensors0/sensors0.component';
import { ContentPageComponent } from './content-page/content-page.component';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { sensorsValueReducer } from './state/sensors-value.reducer';
import { sensorsConfigReducer } from './state/sensors-config.reducer';

import { SensorsModule } from './sensors/sensors.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapComponent,
    Sensors0Component,
    ThingsComponent,
    ContentPageComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD11pjYHyE0ekfygLBNJhvL1FgUp9-twkQ'
    }),
    // ToDo: Try to move in SensorsModule
    StoreModule.forRoot({ sensorsValue: sensorsValueReducer, sensorsConfig: sensorsConfigReducer }),
    EffectsModule.forRoot(), // The EffectsModule.forRoot() method must be added to your AppModule imports
                             // even if you don't register any root-level effects.
                             // https://ngrx.io/guide/effects
    SensorsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
