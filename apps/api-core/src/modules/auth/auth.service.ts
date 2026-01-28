import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  IAuthenticationCallback,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;

    if (!userPoolId || !clientId) {
      throw new Error('Configurações do Cognito não encontradas no .env');
    }

    this.userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    });
  }

  async login(email: string, pass: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: pass,
      });

      const userData = { Username: email, Pool: this.userPool };
      const cognitoUser = new CognitoUser(userData);

      const callback: IAuthenticationCallback = {
        onSuccess: (result: CognitoUserSession) => {
          this.handleLoginSuccess(email, result).then(resolve).catch(reject);
        },
        onFailure: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Falha na autenticação';
          reject(new UnauthorizedException(message));
        },
      };

      cognitoUser.authenticateUser(authenticationDetails, callback);
    });
  }

  // Função auxiliar para lidar com a lógica assíncrona pós-login
  private async handleLoginSuccess(email: string, result: CognitoUserSession) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuário não vinculado ao ERP.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user', 'admin'],
        'x-hasura-user-id': user.id,
        'x-hasura-tenant-id': user.tenantId,
      },
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      id_token: result.getIdToken().getJwtToken(),
      user: { id: user.id, email: user.email, tenantId: user.tenantId },
    };
  }
}
