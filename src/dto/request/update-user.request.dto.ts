import { IsString, IsEmail, IsDate, IsOptional, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserRequestDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Tên không được quá 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'MSSV phải là chuỗi' })
  @Matches(/^[A-Z0-9]+$/, { message: 'MSSV chỉ được chứa chữ hoa và số' })
  mssv?: string;

  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password?: string;

  @IsOptional()
  @IsDate({ message: 'Ngày sinh không hợp lệ' })
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(['nam', 'nữ', 'khác'], { message: 'Giới tính phải là nam, nữ hoặc khác' })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @MaxLength(500, { message: 'Địa chỉ không được quá 500 ký tự' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Bio phải là chuỗi' })
  @MaxLength(500, { message: 'Bio không được quá 500 ký tự' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi' })
  avatar?: string;

  @IsOptional()
  @IsEnum(['user', 'admin'], { message: 'Role phải là user hoặc admin' })
  role?: string;
}
