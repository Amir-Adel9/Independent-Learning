import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Password1!',
    minLength: 8,
    description: 'Min 8 characters, at least one letter, one number, one special character',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
