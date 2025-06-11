import { ApiProperty } from "@nestjs/swagger";

export class ContactPersonDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  address?: string;

  @ApiProperty()
  contact_number?: string;

  @ApiProperty()
  relationship?: string;
}