import { User } from "../entities/user";

export type ParamsType = { [key: string]: string };
export type AuthorizedMethod<Req, Res> = (user: User, data: Req, params?: ParamsType) => Promise<Res>
export type UnauthorizedMethod<Req, Res> = (data: Req, params?: ParamsType) => Promise<Res>

export class NoRequestData { }
export class NoRequestResponse { }