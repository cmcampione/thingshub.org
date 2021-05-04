import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorsValueService } from './sensors-value.service';
import { EffectsModule } from '@ngrx/effects';
import { SensorsConfigEffects } from './sensors-config.effect';
import { SensorsValueEffects } from './sensors-value.effect';
import { SensorsConfigService } from './sensors-config.service';
import { SensorsComponent } from './sensors.component';
import { ThingsSensorsConfigService } from './things-sensors-config.service';
import { ThingsSensorsValueService } from './things-sensors-value.service';

@NgModule({
  declarations: [SensorsComponent],
  imports: [
    CommonModule,
    EffectsModule.forFeature([SensorsValueEffects, SensorsConfigEffects])
  ],
  exports: [SensorsComponent],
  providers: [
    ThingsSensorsConfigService,
    ThingsSensorsValueService,
    SensorsValueService,
    SensorsConfigService
  ]
})
export class SensorsModule { }
