import bcrypt from 'bcrypt';
export class User {
  public email: string;
  public password: string;
  public fullName?: string;
  public role: string;
  public id?: number;
  public phoneNumber?: string;
  public dateOfBirth?: Date;
  public gender?: string;
  public avatar?: string;
  public joinAt?: Date;
  public status?: string;
  public updatedAt?: Date;

  constructor(userData: {
    email: string;
    password: string;
    fullName?: string;
    role?: string;
    id?: number;
    phoneNumber?: string;
    dateOfBirth?: Date | string;
    gender?: string;
    avatar?: string;
    joinAt?: Date | string;
    status?: string;
    updatedAt?: Date | string;
  }) {
    this.email = userData.email;
    this.password = userData.password;
    this.fullName = userData.fullName;
    this.role = userData.role || 'user';
    this.id = userData.id;
    this.phoneNumber = userData.phoneNumber;
    
    // Xử lý Date
    this.dateOfBirth = userData.dateOfBirth instanceof Date 
      ? userData.dateOfBirth 
      : userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined;
    
    this.gender = userData.gender;
    this.avatar = userData.avatar;
    
    this.joinAt = userData.joinAt instanceof Date 
      ? userData.joinAt 
      : userData.joinAt ? new Date(userData.joinAt) : undefined;
    
    this.status = userData.status;
    
    this.updatedAt = userData.updatedAt instanceof Date 
      ? userData.updatedAt 
      : userData.updatedAt ? new Date(userData.updatedAt) : undefined;
  }

  // Các phương thức khác giữ nguyên
  async checkPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  public toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}