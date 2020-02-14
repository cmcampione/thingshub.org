import { Component, OnInit, OnDestroy } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { ThingsManagerService } from '../things-manager.service';

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css'],
  providers: [ThingsManagerService,
    { provide: 'thingKind', useValue: 'first thing' }
  ]
})
export class ThingsComponent implements OnInit, OnDestroy {

  private canceler = new thingshub.HttpRequestCanceler();
  public things: thingshub.Thing[];

  constructor(private readonly thingsManager: ThingsManagerService) {
      this.things = this.thingsManager.mainThing.children;
  }

  async ngOnInit() {
    this.thingsManager.init();
    await this.thingsManager.thingsManager.getMoreThings(this.canceler);
  }

  ngOnDestroy() {
    this.thingsManager.done();
  }

  public async recall() {
      try {
        await this.thingsManager.thingsManager.getMoreThings(this.canceler);
      } catch (e) {
        console.log(e);
      }
  }
}
