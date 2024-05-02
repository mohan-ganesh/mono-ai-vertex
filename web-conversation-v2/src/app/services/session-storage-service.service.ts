import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageServiceService {

  constructor() { }

  getValue(key: string): any {
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? storedValue : null;
  }

  setValue(key: string, value: any): void {
    sessionStorage.setItem(key, value);
  }

}
