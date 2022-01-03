import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { ThingComponent } from './things/thing/thing.component';
import { ThingsComponent } from './things/things.component';
import { Sensors0Component } from './sensors0/sensors0.component';
import { ContentPageComponent } from './content-page/content-page.component';

import { Sensors1Module } from './sensors1/sensors1.module';
import { ThingsSensorsModule } from './sensors2/things-sensors.module';

import { environment } from '../environments/environment';
import { appReducer } from './app.reducer';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MapComponent,
        Sensors0Component,
        ThingComponent,
        ThingsComponent,
        ContentPageComponent
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        FormsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyD11pjYHyE0ekfygLBNJhvL1FgUp9-twkQ'
        }),
        StoreModule.forRoot({}, {
            // https://ngrx.io/guide/store/configuration/runtime-checks
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true,
                strictActionWithinNgZone: true,
                strictActionTypeUniqueness: true,
            }
        }),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
        EffectsModule.forRoot(), // The EffectsModule.forRoot() method must be added to your AppModule imports
        // even if you don't register any root-level effects.
        // https://ngrx.io/guide/effects
        Sensors1Module,
        ThingsSensorsModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
