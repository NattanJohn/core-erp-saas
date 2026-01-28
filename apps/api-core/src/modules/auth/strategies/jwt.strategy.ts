import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    if (!userPoolId) {
      throw new Error('COGNITO_USER_POOL_ID não definido');
    }

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.us-east-1.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      }),
      algorithms: ['RS256'],
    };

    super(options);
  }

  validate(payload: JwtPayload) {
    if (!payload) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      claims: payload['https://hasura.io/jwt/claims'],
    };
  }
}
