import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attachment')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  attachment_details: string;

  @Column()
  file_path: string;

  @Column({ default: false })
  is_deleted: boolean;
  
  @Column({ type: 'char', length: 36, nullable: true })
  created_by: string;
  
  @Column({ type: 'char', length: 36, nullable: true })
  updated_by: string;
  
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
  
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
  

}
