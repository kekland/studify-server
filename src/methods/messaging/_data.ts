import { IsNotEmpty, Max, IsNumber, IsArray, IsString, IsUrl, ValidateIf, IsOptional } from "class-validator";
import { Message } from "../../entities/message";
import { Transform, TransformPlainToClass } from "class-transformer";
import { TransformationType } from "class-transformer/TransformOperationExecutor";

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

export class PaginatedData {
  @Transform((v, _) => parseInt(v), { toClassOnly: true })
  @IsNumber()
  @Max(30)
  limit!: number;

  @Transform((v, _) => parseInt(v), { toClassOnly: true })
  @IsNotEmpty()
  @IsNumber()
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

export class UpdateTypingStatusData {
  @IsNotEmpty()
  room!: string;

  @IsNotEmpty()
  status!: boolean;
}

export interface IFileUploaded {
  name: string;
  url: string;
}

export class UploadFilesResponse {
  files: IFileUploaded[];

  constructor(files: IFileUploaded[]) {
    this.files = files
  }
}