export type TokenPayload = {
  sub: string;
  iat: number;
  jti: string;
};

export type TokenPayloadRes = {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
};
