import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column()
  status: string; // You can use an enum or string values for status.

  @Column()
  jobTitle: string;

  @Column()
  application_id: string;

  @CreateDateColumn()
  created_at: Date;

  @CreateDateColumn()
  updated_at: Date;

  
  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;
  
  @Column()
  created_by: string;
  
  @Column()
  updated_by: string;
}
