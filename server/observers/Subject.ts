import { Observer } from './Observer';

/**
 * Subject interface - Định nghĩa interface cho các subject
 * Các subject sẽ quản lý và thông báo cho các observers
 */
export interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObservers(data: any): Promise<void>;
} 