import { IsString, IsDate, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, PreferredJobShift } from '../entities/user-profile.entity';

export class CreateUserProfileDto {
    @ApiProperty()
    @IsString()
    user_id: string;

    @ApiProperty()
    @IsDate()
    dob: Date;

    @ApiProperty()
    @IsString()
    mobile: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    first_name: string;

    @ApiProperty()
    @IsString()
    last_name: string;

    @ApiProperty()
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty()
    @IsString()
    key_skills: string;

    @ApiProperty()
    @IsString()
    work_experiences: string;

    @ApiProperty()
    @IsString()
    current_company: string;

    @ApiProperty()
    @IsString()
    current_salary: string;

    @ApiProperty()
    @IsString()
    expected_salary: string;

    @ApiProperty()
    @IsString()
    preferred_location: string;

    @ApiProperty()
    @IsString()
    preferred_job_role: string;

    @ApiProperty()
    @IsEnum(PreferredJobShift)
    preferred_shift: PreferredJobShift;

    @ApiProperty()
    @IsString()
    languages_known: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    is_deleted?: boolean; // Optional field

    @ApiProperty()
    @IsString()
    created_by: string;

    @ApiProperty()
    @IsString()
    updated_by: string;
}
