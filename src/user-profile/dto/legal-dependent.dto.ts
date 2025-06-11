import { ApiProperty } from "@nestjs/swagger";

export class LegalDependentDTO {
  @ApiProperty()
  full_name?: string;

  @ApiProperty()
  gender?: string;

  @ApiProperty()
  date_of_birth?: Date;

  @ApiProperty()
  relationship?: string;
}