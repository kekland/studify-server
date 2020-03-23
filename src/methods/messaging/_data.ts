import { IsNotEmpty } from "class-validator";
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