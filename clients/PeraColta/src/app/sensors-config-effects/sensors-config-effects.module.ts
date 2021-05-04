import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThingsService } from '../things.service';
import { SensorsConfigService } from '../sensors/sensors-config.service';
import { EffectsModule } from '@ngrx/effects';
import { SensorsConfigEffects } from './sensors-Config.effect';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EffectsModule.forFeature([SensorsConfigEffects])
  ],
  providers: [
    { provide: 'thingKind', useValue: 'Config' },
    ThingsService,
    SensorsConfigService
  ]
})
export class SensorsConfigEffectsModule { }
