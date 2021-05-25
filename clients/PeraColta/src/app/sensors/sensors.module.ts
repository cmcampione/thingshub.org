import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorsValueService } from './sensors-value.service';
import { EffectsModule } from '@ngrx/effects';
import { SensorsConfigEffects } from './sensors-config.effect';
import { SensorsValueEffects } from './sensors-value.effect';
import { SensorsConfigService } from './sensors-config.service';
import { SensorsComponent } from './sensors.component';
import { ThingsSensorsConfigService } from './things-sensors-config.service';
import { ThingsSensorsValueService } from './things-sensors-value.service';
import { sensorsConfigReducer } from '../sensors/sensors-config.reducer';
import { sensorsValueReducer } from '../sensors/sensors-value.reducer';
import { StoreModule } from '@ngrx/store';
import { SensorComponent } from './sensor/sensor.component';
import { SensorsConfigFeatureName, SensorsValueFeatureName } from './sensors.selectors';

@NgModule({
  declarations: [SensorsComponent, SensorComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // To disable some error message from ionic
  imports: [
    CommonModule,
    StoreModule.forFeature(SensorsValueFeatureName, sensorsValueReducer),
    StoreModule.forFeature(SensorsConfigFeatureName, sensorsConfigReducer),
    EffectsModule.forFeature([SensorsValueEffects, SensorsConfigEffects])
  ],
  exports: [SensorsComponent],
  providers: [
    ThingsSensorsConfigService, // It's necessary for Effect bootstrap
    ThingsSensorsValueService,  // It's necessary for Effect bootstrap
    SensorsValueService,        // It's necessary for Effect bootstrap
    SensorsConfigService        // It's necessary for Effect bootstrap
  ]
})
export class SensorsModule { }
