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

  private sidePage    = SidePageComponent;
  private contentPage = ContentPageComponent;

  @ViewChild('splitter') splitter;

  constructor(private menuService: MenuService) {
    this.menuService.menu$.subscribe(() => this.splitter.nativeElement.side.open());
  }
}
