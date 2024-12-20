import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
// import { User } from "src/user/entities/user.entity";
import { JobPosting } from "src/job-posting/entities/job-posting.entity";

@Entity()
export class Application {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // @ManyToOne(() => JobPosting, (job) => job.id)
    // job_id: JobPosting;

    // @ManyToOne(() => User, (user) => user.id)
    // user_id: User;

    @Column({ type: "enum", enum: ["Pending", "Shortlisted", "Rejected", "Hired"], nullable: true })
    status: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    comments: string;

    
    @Column({ type: "varchar", length: 255, nullable: true })
    cv_path: string;

    @Column({ type: "text", nullable: true })
    additional_info: string;

    @Column({ type: "text", nullable: true })
    work_experiences: string;

    @CreateDateColumn()
    applied_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: "tinyint", default: 0 })
    is_deleted: boolean;

    // @ManyToOne(() => User, (user) => user.id)
    // created_by: User;

    // @ManyToOne(() => User, (user) => user.id)
    // updated_by: User;
}
