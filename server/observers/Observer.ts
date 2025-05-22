/**
 * Observer interface - Định nghĩa interface cho các observer
 * Các observer sẽ nhận thông báo khi có bài test mới được thêm vào
 */
export interface Observer {
  update(data: any): Promise<void>;
} 