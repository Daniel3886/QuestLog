import { IsEmail } from 'class-validator';

export class SendFriendRequestDto {
  @IsEmail()
  friendEmail!: string;
}
