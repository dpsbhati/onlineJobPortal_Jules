import { ApiProperty } from "@nestjs/swagger";

export class TravelDocumentsDTO {
  @ApiProperty()
  document_name?: string;

  @ApiProperty()
  document_number?: string;

  @ApiProperty()
  issue_place?: string;

  @ApiProperty()
  issue_date?: Date;

  @ApiProperty()
  exp_date?: Date;
}