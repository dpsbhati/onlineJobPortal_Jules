import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  PrimaryColumn,
  Generated,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class Users {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  refreshToken: string;

  @Column()
  lastName: string;

  // @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

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

  // @Column({ nullable: true })
  // resetPasswordToken: string;

  // @Column({ type: 'timestamp', nullable: true })
  // resetPasswordExpires: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validateResetToken(token: string) {
    // return this.resetPasswordToken === token && new Date();
  }
}
