import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryColumn,
  Generated,
  OneToOne,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';
import { applications } from 'src/application/entities/application.entity';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { CareerType } from '../enums/career-type.enum';

@Entity('users')
export class Users {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: CareerType,
  })
  career_type: CareerType;

  @Column()
  refreshToken: string;

  @Column()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isJobAlerts: boolean;

  @Column({ default: false })
  isNewsLetters: boolean;

  @Column({ default: false })
  isPrivacyPolicy: boolean;

  @Column()
  isPasswordReset: boolean;

  @Column()
  resetToken: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'applicant', 'employer'],
    nullable: true,
  })
  role: string;

  @Column({ default: true })
  is_deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  @OneToOne(() => UserProfile, (profile) => profile.user, { eager: true })
  userProfile: UserProfile;

  @OneToMany(() => applications, (application) => application.user) // Relation with applications
  applications: applications[];

  @OneToMany(() => JobPosting, (jobPosting) => jobPosting.user) // Relation with applications
  jobPosting: JobPosting[];
}
