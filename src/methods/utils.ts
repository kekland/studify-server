import { User } from "../entities/user";

export type AuthorizedMethod<Req, Res> = (user: User, data: Req) => Promise<Res>
export type UnauthorizedMethod<Req, Res> = (data: Req) => Promise<Res>