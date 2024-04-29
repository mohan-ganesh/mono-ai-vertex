import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageServiceService {

  constructor() { }

  getValue(key: string): any {
    console.log(this + " key " + key);
    const storedValue = sessionStorage.getItem(key);
    console.log(this + " value " + storedValue);
    return storedValue ? storedValue : null;
  }

  setValue(key: string, value: any): void {
    console.log(this + " key " + key + ", value " + value);
    sessionStorage.setItem(key, value);
  }

}
