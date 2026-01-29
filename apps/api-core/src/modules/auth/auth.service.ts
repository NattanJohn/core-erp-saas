import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  IAuthenticationCallback,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { RegisterDto } from './dto/register.dto';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';

export interface LoginResponse {
  access_token: string;
  id_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    tenant?: {
      name: string;
      slug: string;
    };
  };
}

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

  async login(email: string, pass: string): Promise<LoginResponse> {
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
      name: user.name,
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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
    };
  }

  async register(data: RegisterDto) {
    const { email, password, name, companyName } = data;

    const tenant = await this.usersService.createTenant(companyName);

    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({ Name: 'name', Value: name }),
        new CognitoUserAttribute({ Name: 'custom:tenantId', Value: tenant.id }),
      ];

      this.userPool.signUp(
        email,
        password,
        attributeList,
        [],
        (err, result) => {
          if (err) {
            return reject(
              new BadRequestException(err.message || 'Erro no Cognito'),
            );
          }

          void (async () => {
            try {
              const user = await this.usersService.createUser({
                email,
                name,
                tenantId: tenant.id,
                role: 'admin',
              });

              resolve({
                message:
                  'Registro realizado com sucesso! Verifique seu e-mail.',
                userId: user.id,
                tenantId: tenant.id,
                cognitoSub: result?.userSub,
              });
            } catch (dbError: any) {
              // CORREÇÃO: Garante que o dbError seja um objeto de Erro
              reject(
                dbError instanceof Error ? dbError : new Error(String(dbError)),
              );
            }
          })();
        },
      );
    });
  }

  async confirmRegistration(data: ConfirmRegistrationDto) {
    const { email, code } = data;

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          return reject(
            new BadRequestException(
              err.message || 'Código inválido ou expirado.',
            ),
          );
        }
        resolve({
          message: 'E-mail confirmado com sucesso! Você já pode fazer login.',
          result,
        });
      });
    });
  }
}
