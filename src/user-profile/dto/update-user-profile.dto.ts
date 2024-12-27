import { IsString, IsDate, IsEmail, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Gender, PreferredJobShift } from '../entities/user-profile.entity';

export class UpdateUserProfileDto {
    @IsOptional()
    @IsString()
    user_id?: string;

    @IsOptional()
    @IsDate()
    dob?: Date;

    @IsOptional()
    @IsString()
    mobile?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    key_skills?: string;

    @IsOptional()
    @IsString()
    work_experiences?: string;

    @IsOptional()
    @IsString()
    current_company?: string;

    @IsOptional()
    @IsString()
    current_salary?: string;

    @IsOptional()
    @IsString()
    expected_salary?: string;

    @IsOptional()
    @IsString()
    preferred_location?: string;

    @IsOptional()
    @IsString()
    preferred_job_role?: string;

    @IsOptional()
    @IsEnum(PreferredJobShift)
    preferred_shift?: PreferredJobShift;

    @IsOptional()
    @IsString()
    languages_known?: string;

    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;

    @IsOptional()
    @IsString()
    updated_by?: string;
}
