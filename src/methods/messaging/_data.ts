import { IsNotEmpty, Max, IsNumber, IsArray, IsString, IsUrl, ValidateIf, IsOptional, ValidateNested } from "class-validator";
import { Message, Attachment } from "../../entities/message";
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
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsString()
  idempotencyId?: string;
}

export class SendMessageResponse {
  message: Message;
  idempotencyId?: string;

  constructor(message: Message, idempotencyId?: string) {
    this.message = message
    this.idempotencyId = idempotencyId
  }

  static transform(data: SendMessageResponse) {
    return {
      message: Message.transformSocket(data.message),
      idempotencyId: data.idempotencyId,
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