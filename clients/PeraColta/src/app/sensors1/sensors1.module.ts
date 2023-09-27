import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SensorsValueService } from './sensors1-value.service';
import { EffectsModule } from '@ngrx/effects';
import { Sensors1ConfigEffects } from './sensors1-config.effect';
import { Sensors1ValueEffects } from './sensors1-value.effect';
import { Sensors1ConfigService } from './sensors1-config.service';
import { Sensors1Component } from './sensors1.component';
import { ThingsSensors1ConfigService } from './things-sensors1-config.service';
import { ThingsSensors1ValueService } from './things-sensors1-value.service';
import { sensorsConfigReducer } from './sensors1-config.reducer';
import { sensorsValueReducer } from './sensors1-value.reducer';
import { StoreModule } from '@ngrx/store';
import { Sensor1Component } from './sensor1/sensor1.component';
import { Sensors1ConfigFeatureName, Sensors1ValueFeatureName } from './sensors1.selectors';

@NgModule({
  declarations: [Sensors1Component, Sensor1Component], // ToDO: Is necessary to declare SensorComponent
  imports: [
    CommonModule,
    IonicModule,
    StoreModule.forFeature(Sensors1ValueFeatureName, sensorsValueReducer),
    StoreModule.forFeature(Sensors1ConfigFeatureName, sensorsConfigReducer),
    EffectsModule.forFeature([Sensors1ValueEffects, Sensors1ConfigEffects])
  ],
  exports: [Sensors1Component],
  providers: [
    ThingsSensors1ConfigService, // It's necessary for Effect bootstrap
    ThingsSensors1ValueService,  // It's necessary for Effect bootstrap
    SensorsValueService,        // It's necessary for Effect bootstrap
    Sensors1ConfigService        // It's necessary for Effect bootstrap
  ]
})
export class Sensors1Module { }
