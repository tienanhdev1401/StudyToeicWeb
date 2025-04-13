export class User {
  constructor(
    public email: string,
    public password: string,
    public fullName?: string,
    public role: string = 'user',
    public id?: number,
    public phoneNumber?: string,
    public dateOfBirth?: Date,
    public gender?: string,
    public avatar?: string,
    public joinAt?: Date,
    public status?: number,
    public updatedAt?: Date
  ) {}

  // Phương thức kiểm tra mật khẩu
  checkPassword(password: string): boolean {
    // Trong thực tế bạn sẽ sử dụng bcrypt.compare ở đây
    return this.password === password;
  }

  // Phương thức để lấy thông tin người dùng mà không có mật khẩu
  public toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}