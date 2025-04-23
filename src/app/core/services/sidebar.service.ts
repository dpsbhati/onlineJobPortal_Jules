import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSource = new BehaviorSubject<boolean>(true)
  isCollapsed$ = this.collapsedSource.asObservable()

  setCollapsed (value: boolean) {
    this.collapsedSource.next(value)
  }
}
