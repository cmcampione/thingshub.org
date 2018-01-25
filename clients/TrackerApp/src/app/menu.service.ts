import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MenuService {

  subject = new Subject();
  get menu$(): Observable<any> {
    return this.subject.asObservable();
  }
  open() {
    this.subject.next();
  }

}
