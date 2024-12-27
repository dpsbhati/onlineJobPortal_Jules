import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  // private currentRole: string;

  // setRole(role: string) {
  //   this.currentRole = role;
  // }

  // getRole(): string {
  //   return this.currentRole;
  // }

  // canAccess(link: string): boolean {
  //   // return this.roles[this.currentRole]?.includes(link);
  //   return this.roles[this.currentRole]?.some(allowedRoute => {
  //     const routeRegex = new RegExp(`^${allowedRoute}$`);
  //     return routeRegex.test(link);
  //   });
  // }

}
