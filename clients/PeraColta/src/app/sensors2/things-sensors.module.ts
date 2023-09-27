import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SensorsConfigEffects } from './config/sensors-config.effect';
import { ThingsSensorsEffects } from './things-sensors.effect';
import { SensorsConfigService } from './config/sensors-config.service';
import { ThingsSensorsConfigService } from './config/things-sensors-config.service';
import { ThingsSensorsValueService } from './things-sensors-value.service';
import { sensorsConfigReducer } from './config/sensors-config.reducer';
import { thingsSensorsReducer } from './things-sensors.reducer';
import { SensorComponent } from './sensor/sensor.component';
import { SensorsComponent } from './sensors/sensors.component';
import { SensorsConfigFeatureName, ThingsSensorsFeatureName } from './things-sensors.selectors';
import { ThingsSensorsComponent } from './things-sensors.component';
import { ThingsSensorsService } from './things-sensors.service';

@NgModule({
  declarations: [ThingsSensorsComponent, SensorsComponent, SensorComponent],
  imports: [
    CommonModule,
    IonicModule,
    StoreModule.forFeature(SensorsConfigFeatureName, sensorsConfigReducer),
    StoreModule.forFeature(ThingsSensorsFeatureName, thingsSensorsReducer),

    EffectsModule.forFeature([SensorsConfigEffects, ThingsSensorsEffects])
  ],
  exports: [ThingsSensorsComponent],
  providers: [
    ThingsSensorsConfigService, // It's necessary for Effect bootstrap
    ThingsSensorsValueService,  // It's necessary for Effect bootstrap
    ThingsSensorsService,       // It's necessary for Effect bootstrap
    SensorsConfigService        // It's necessary for Effect bootstrap
  ]
})
export class ThingsSensorsModule { }
