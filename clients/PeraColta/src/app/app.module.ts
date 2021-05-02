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

import { FormsModule } from '@angular/forms';
import { SensorsService } from './sensors.service';
import { ThingsService } from './things.service';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducers, metaReducers, SensorEffects } from './reducers';
import { Sensors1Component } from './sensors1/sensors1.component';

import { sensorsValueReducer } from './state/sensors-value.reducer';
import { sensorsConfigReducer } from './state/sensors-config.reducer';
import { SensorsValueService } from './sensors-value.service';
import { SensorValueEffects } from './sensor-value.effect';
import { Sensors2Component } from './sensors2/sensors2.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapComponent,
    SensorsComponent,
    Sensors1Component,
    Sensors2Component,
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
    StoreModule.forRoot({ sensorsValue: sensorsValueReducer, sensorsConfig: sensorsConfigReducer }),
    EffectsModule.forRoot([SensorEffects, SensorValueEffects])
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: 'thingKind', useValue: 'Home appliance' }, // ToDo: To fix for different types
    ThingsService,
    {
      provide: SensorsService,
      deps: [ThingsService]
    },
    {
      provide: SensorsValueService,
      deps: [ThingsService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
