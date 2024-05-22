export class TokenPayload {
  sub: string;
  iat: number;
  jti: string;
}

export class TokenPayloadRes {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}
