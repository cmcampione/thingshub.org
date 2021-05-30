import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { ThingsService } from '../things.service';

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css'],
  providers: [
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsService,
  ]
})
export class ThingsComponent implements OnInit, OnDestroy {

  private canceler = new HttpRequestCanceler();
  public things: thingshub.Thing[];

  constructor(private readonly thingsService: ThingsService) {
      this.things = this.thingsService.mainThing.children;
  }

  async ngOnInit() {
    this.thingsService.init();
    await this.thingsService.thingsManager.getMoreThings(this.canceler);
  }
  ngOnDestroy() {
    this.thingsService.done();
  }

  public async recall() {
      try {
        await this.thingsService.thingsManager.getMoreThings(this.canceler);
      } catch (e) {
        console.log(e);
      }
  }
}
