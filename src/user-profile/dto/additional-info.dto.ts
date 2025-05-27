import { ApiProperty } from '@nestjs/swagger';

export class LanguageSpokenDto {
  @ApiProperty()
  language: string;

  @ApiProperty()
  proficiency: string;
}

export class LanguageWrittenDto {
  @ApiProperty()
  language: string;

  @ApiProperty()
  proficiency: string;
}

export class NoticePeriodDto {
  @ApiProperty()
  notice_period_months: number;

  @ApiProperty()
  commence_work_date: Date;
}

export class CurrentSalaryDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: number;
}

export class ExpectedSalaryDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: number;
}

export class PreferencesDto {
  @ApiProperty()
  department: string[];

  @ApiProperty()
  location: string[];
}

export class AdditionalInfoDto {
  @ApiProperty()
  additional_info: string;
}

export class VacancySourceDto {
  @ApiProperty()
  vacancy_source: string;
}
