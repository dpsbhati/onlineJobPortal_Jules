import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('travel_documents')
export class TrainingCertificate {
@Column()
   traning_type_id?: string;
 
   @Column()
   user_id?: string;
 
 
 @Column()
   certificate_type?: string;
 
 @Column()
   document_number?: string;
 
 @Column()
   issue_place?: string;
 
 @Column()
   issue_date?: Date;
 
 @Column()
   exp_date?: Date;
}
