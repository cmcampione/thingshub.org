import { Component, ViewChild } from '@angular/core';
import { SidePageComponent } from './side-page/side-page.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { MenuService } from './menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public sidePage    = SidePageComponent;
  public contentPage = ContentPageComponent;

  @ViewChild('splitter', {static: false}) splitter;

  constructor(private menuService: MenuService) {
    this.menuService.menu$.subscribe(() => this.splitter.nativeElement.side.open());
  }

  OnDestroy() {
    //this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
  }
}
