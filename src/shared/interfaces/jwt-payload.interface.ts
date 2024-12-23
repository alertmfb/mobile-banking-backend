export interface JwtPayload {
  sub: string;
  id?: string;
  email?: string;
  name?: string;
  username?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}
