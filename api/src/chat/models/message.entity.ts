import { UserEntity } from "src/auth/models/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConversationEntity } from "./conversation.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @ManyToOne(() => ConversationEntity, (conversationEntity) => conversationEntity.messages)
    conversation: ConversationEntity;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.messages)
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;
}