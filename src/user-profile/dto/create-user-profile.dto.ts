import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";
import { Gender } from "../entities/user-profile.entity";


export class CreateUserProfileDto {
    @PrimaryGeneratedColumn('uuid')
    @IsOptional()
    @IsUUID(4, { message: `id of the user should be a valid UUID` })
    id: string;

    @ApiProperty({ description: `Id of the user` })
    @IsNotEmpty({ message: `user_id cannot be empty or null` })
    @IsUUID(4, { message: `user_id must be a valid UUID` })
    user_id: string;

    @ApiProperty({ description: `First name of the user's name` })
    @IsString({ message: `first_name must be a valid string value` })
    first_name: string;

    @ApiProperty({ description: `Last name of the user's name` })
    @IsString({ message: `last_name must be a valid string value` })
    last_name: string;

    @ApiProperty({ description: `Date of Birth of user` })
    @IsNotEmpty({ message: `dob cannot be empty` })
    dob: Date;

    @ApiProperty({ description: `respective gender of the user` })
    @IsNotEmpty({ message: `gender cannot be empty or null` })
    @IsEnum(Gender, { message: `gender must be one of the following: ${Object.values(Gender).join(', ')}` })
    gender: Gender;

    @ApiProperty({ description: `Email of the user` })
    @IsNotEmpty({ message: `email of the user cannot be empty` })
    @IsString({ message: `email must be the valid string value` })
    email: string;

    @ApiProperty({ description: `Mobile number of the user` })
    @IsNotEmpty({ message: `Mobile number cannot be Empty` })
    mobile: string;

}
