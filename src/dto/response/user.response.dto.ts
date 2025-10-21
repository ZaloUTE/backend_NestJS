export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  mssv: string;
  dateOfBirth: Date;
  gender?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user._id || user.id;
    this.name = user.name;
    this.email = user.email;
    this.mssv = user.mssv;
    this.dateOfBirth = user.dateOfBirth;
    this.gender = user.gender;
    this.address = user.address;
    this.bio = user.bio;
    this.avatar = user.avatar;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
