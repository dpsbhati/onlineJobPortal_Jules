import { ApiProperty } from '@nestjs/swagger';

export class CreateRankDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  rank_name: string;
  @ApiProperty()
  orderId: number;
}
