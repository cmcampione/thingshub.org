import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AgmCoreModule } from '@agm/core';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { ThingsComponent } from './things/things.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { SensorsComponent } from './sensors/sensors.component';
import { Sensors1Component } from './sensors1/sensors1.component';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers, SensorEffects } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { SensorsService } from './sensors.service';
import { ThingsService } from './things.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapComponent,
    SensorsComponent,
    Sensors1Component,
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
    StoreModule.forRoot(reducers, {metaReducers}),
    EffectsModule.forRoot([SensorEffects])
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsService,
    {
      provide: SensorsService,
      deps: [ThingsService]
    },
    SensorsService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
