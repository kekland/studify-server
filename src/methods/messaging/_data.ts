import { IsNotEmpty, Max, IsNumber, IsArray, IsString, IsUrl, ValidateIf, IsOptional } from "class-validator";
import { Message } from "../../entities/message";

export class SendMessageData {
  @IsNotEmpty()
  @IsString()
  groupId!: string;

  @IsNotEmpty()
  @IsString()
  body!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  idempotencyId?: string;
}

export class SendMessageResponse {
  message: Message;

  constructor(message: Message) {
    this.message = message
  }

  static transform(data: SendMessageResponse, idempotencyId?: string) {
    return {
      message: Message.transformSocket(data.message),
      idempotencyId: idempotencyId,
    }
  }
}

export class GetMessagesData {
  @IsNotEmpty()
  groupId!: string;

  @IsNumber()
  @Max(30)
  limit!: number;

  @IsNotEmpty()
  skip!: number;
}

export class GetMessagesResponse {
  messages: Message[];

  constructor(messages: Message[]) {
    this.messages = messages
  }

  static transform(data: GetMessagesResponse) {
    return {
      messages: data.messages.map(message => Message.transformSocket(message))
    }
  }
}