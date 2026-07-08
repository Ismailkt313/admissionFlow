export abstract class ITokenService {
  abstract generateToken(payload: { sub: string; email: string; role: string }): Promise<string>;
}
