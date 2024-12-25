import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHERS = 'OTHERS'
}

export enum PreferredJobShift {
    DAY = 'DAY',
    NIGHT = 'NIGHT',
    FLEXIBLE = 'FLEXIBLE'
}

@Entity('user-profile')
export class UserProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'char' })
    user_id: string;

    @Column({ type: 'date' })
    dob: Date;

    @Column({ type: 'varchar' })
    mobile: string;

    @Column({ type: 'varchar' })
    email: string;

    @Column({ type: 'varchar' })
    first_name: string;

    @Column({ type: 'varchar' })
    last_name: string;

    @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
    gender: Gender;

    @Column({ type: 'text' })
    key_skills: string;

    @Column({ type: 'text' })
    work_experiences: string;

    @Column({ type: 'varchar' })
    current_company: string;

    @Column({ type: 'varchar' })
    current_salary: string;

    @Column({ type: 'varchar' })
    expected_salary: string;

    @Column({ type: 'varchar' })
    preferred_location: string;

    @Column({ type: 'varchar' })
    preferred_job_role: string;

    @Column({ type: 'enum', enum: PreferredJobShift, default: PreferredJobShift.FLEXIBLE })
    preferred_shift: PreferredJobShift;

    @Column({ type: 'varchar' })
    languages_known: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ type: 'char' })
    created_by: string;

    @Column({ type: 'char' })
    updated_by: string;
}
