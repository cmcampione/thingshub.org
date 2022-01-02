import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SensorsConfigEffects } from './sensors-config.effect';
import { ThingsSensorsEffects } from './things-sensors.effect';
import { SensorsConfigService } from './sensors-config.service';
import { ThingsSensorsConfigService } from './things-sensors-config.service';
import { ThingsSensorsThingService } from './things-sensors-thing.service';
import { sensorsConfigReducer } from './sensors-config.reducer';
import { thingsSensorsReducer } from './things-sensors.reducer';
import { SensorComponent } from './sensor/sensor.component';
import { SensorsComponent } from './sensors.component';
import { SensorsConfigFeatureName, ThingsSensorsFeatureName } from './sensors.selectors';
import { ThingsSensorsComponent } from './things-sensors.component';
import { ThingsSensorsService } from './things-sensors.service';

@NgModule({
  declarations: [ThingsSensorsComponent, SensorsComponent, SensorComponent], // ToDO: Is necessary to declare SensorsComponent, SensorComponent
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // To disable some error message from ionic
  imports: [
    CommonModule,
    StoreModule.forFeature(SensorsConfigFeatureName, sensorsConfigReducer),
    StoreModule.forFeature(ThingsSensorsFeatureName, thingsSensorsReducer),

    EffectsModule.forFeature([SensorsConfigEffects, ThingsSensorsEffects])
  ],
  exports: [ThingsSensorsComponent],
  providers: [
    ThingsSensorsConfigService, // It's necessary for Effect bootstrap
    ThingsSensorsThingService,  // It's necessary for Effect bootstrap
    ThingsSensorsService,
    SensorsConfigService       // It's necessary for Effect bootstrap
  ]
})
export class Sensors2Module { }
