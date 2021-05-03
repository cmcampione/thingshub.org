import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThingsService } from '../things.service';
import { SensorsValueService } from '../sensors-value.service';
import { EffectsModule } from '@ngrx/effects';
import { SensorsValueEffects } from './sensors-value.effect';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EffectsModule.forFeature([SensorsValueEffects])
  ],
  providers: [
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsService,
    SensorsValueService
  ]
})
export class SensorsValueEffectsModule { }
