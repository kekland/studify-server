import { IsNotEmpty, Max, IsNumber } from "class-validator";
import { Message } from "../../entities/message";

export class SendMessageData {
  @IsNotEmpty()
  groupId!: string;

  @IsNotEmpty()
  body!: string;

  @IsNotEmpty()
  attachments!: string[];
}

export class SendMessageResponse {
  message: Message;

  constructor(message: Message) {
    this.message = message
  }

  static transform(data: SendMessageResponse) {
    return {
      message: Message.transformSocket(data.message)
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