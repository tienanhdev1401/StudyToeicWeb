export class User {
    id?: number;
    email: string;
    password: string;
    role: string;
  
    constructor(email: string, password: string, role: string = 'user', id?: number) {
      this.id = id;
      this.email = email;
      this.password = password;
      this.role = role;
    }
  
    // Phương thức kiểm tra mật khẩu
    checkPassword(password: string): boolean {
      return this.password === password;
      // Nếu muốn dùng bcrypt:
      // return bcrypt.compareSync(password, this.password);
    }
  }