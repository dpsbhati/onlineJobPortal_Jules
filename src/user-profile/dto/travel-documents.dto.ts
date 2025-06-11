import { ApiProperty } from "@nestjs/swagger";

export class TravelDocumentsDTO {

  id?: string;

  @ApiProperty()
  travel_document_type_id?: string;

  @ApiProperty()
  document_name?: string;

      @ApiProperty()
  user_id?: string;

  @ApiProperty()
  document_number?: string;

  @ApiProperty()
  issue_place?: string;

  @ApiProperty()
  issue_date?: Date;

  @ApiProperty()
  exp_date?: Date;
}