import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThingsService } from '../things.service';
import { SensorsValueService } from './sensors-value.service';
import { EffectsModule } from '@ngrx/effects';
import { SensorsValueEffects } from './sensors-value.effect';
import { SensorsConfigService } from './sensors-config.service';
import { SensorsComponent } from './sensors.component';

@NgModule({
  declarations: [SensorsComponent],
  imports: [
    CommonModule,
    EffectsModule.forFeature([SensorsValueEffects, SensorsConfigService])
  ],
  exports: [SensorsComponent],
  providers: [
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsService,
    SensorsValueService,
    SensorsConfigService
  ]
})
export class SensorsModule { }
