import { Observer } from './Observer';
import { Subject } from './Subject';
import { Test } from '../models/Test';

/**
 * TestSubject - Một lớp cụ thể triển khai Subject interface
 * Quản lý và thông báo cho các observer khi có bài test mới
 */
export class TestSubject implements Subject {
  private observers: Observer[] = [];


  addObserver(observer: Observer): void {
    this.observers.push(observer);
    console.log(`Đã thêm observer: ${observer.constructor.name}`);
  }


  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter(obs => obs !== observer);
    console.log(`Đã xóa observer: ${observer.constructor.name}`);
  }

 
  async notifyObservers(test: Test): Promise<void> {
    console.log(`Thông báo cho ${this.observers.length} observers về bài test mới: ${test.title}`);
    for (const observer of this.observers) {
      await observer.update(test);
    }
  }
}

// Tạo và export một instance để sử dụng trong toàn bộ ứng dụng
export const testSubject = new TestSubject(); 