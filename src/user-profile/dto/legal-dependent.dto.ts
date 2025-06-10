import { ApiProperty } from "@nestjs/swagger";

export class LegalDependentDTO {
  @ApiProperty()
  full_name?: string;

  @ApiProperty()
  gender?: Date;

  @ApiProperty()
  date_of_birth?: string;

  @ApiProperty()
  relationship?: string;
}