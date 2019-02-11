import { Injectable } from '@angular/core';

const KEY_PREFIX = 'jarcam';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;

  static generateStorageKey(key: string): string {
    return `${KEY_PREFIX}_${key}`;
  }

  constructor() {
    this.storage = localStorage;
  }

  get(key: string): any {
    const storageKey = StorageService.generateStorageKey(key);
    const value = this.storage.getItem(storageKey);
    return this.getGettable(value);
  }

  load(key: string): any {
    const storageKey = StorageService.generateStorageKey(key);
    const value = this.storage.getItem(storageKey);
    return atob(value);
  }

  loadAsObject(key: string): any {
    const storageKey = StorageService.generateStorageKey(key);
    const value = this.storage.getItem(storageKey);
    return JSON.parse(value);
  }

  set(key: string, value: any): void {
    const storageKey = StorageService.generateStorageKey(key);
    this.storage.setItem(storageKey, this.getSettable(value));
  }

  public save(key: string, value: any): void {
    const storageKey = StorageService.generateStorageKey(key);
    this.storage.setItem(storageKey, btoa(value));
  }

  public saveAsObject(key: string, value: any): void {
    const storageKey = StorageService.generateStorageKey(key);
    this.storage.setItem(storageKey, JSON.stringify(value));
  }

  remove(key: string): void {
    const storageKey = StorageService.generateStorageKey(key);
    this.storage.removeItem(storageKey);
  }

  private getSettable(value: any): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private getGettable(value: string): any {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
}
