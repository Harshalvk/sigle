import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateDomainDto {
  @IsString()
  @ApiProperty()
  domain: string;
}
