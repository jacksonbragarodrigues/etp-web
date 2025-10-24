import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertUtils } from 'src/utils/alerts.util';
import { AuthService } from '@administrativo/core';
import jwt_decode from 'jwt-decode';
import { Unidades } from '../shared/models/unidade.model';
import { PessoalExterno } from '../shared/models/pessoal-externo.model';
import { UnidadeService } from '../services/uniade-service.service';
import { PessoalExternoService } from '../services/pessoal-externo.service';

@Injectable({ providedIn: 'root' })
export class AuthLoginGuard {
  pessoalExterno: any;
  indAtribuicaoUnidade = 4;
  dadosUnidadeExterna!: Unidades;
  isUnidSobResponsabilidade: any;

  constructor(
    private alertUtil: AlertUtils,
    private authService: AuthService,
    private pessoalExternoService: PessoalExternoService,
    private unidadeService: UnidadeService,
    private router: Router
  ) { }

  async canActivate(): Promise<boolean> {
    const tokenInfo = this.getDecodedAccessToken(
      this.authService.getStorage().getItem('token')
    );

    let promise = new Promise((resolve, reject) => {
      if (this.authService.isLoggedLoginUnico()) {
        this.pessoalExternoService
          .getDadosPessoalExternaBycpf(tokenInfo.cpf)
          .subscribe({
            next: (pessoalEx: PessoalExterno) => {
              this.pessoalExterno = pessoalEx;
              if (this.pessoalExterno) {
                this.unidadeService
                  .getUnidadeExterna(tokenInfo.cpf)
                  .subscribe((resp) => {
                    if (resp.length > 0) {
                      resolve(true);
                    } else {
                      this.isUnidSobResponsabilidade = true;
                      reject(false);
                    }
                  });
              } else {
                this.unidadeService
                  .getUnidade(this.indAtribuicaoUnidade)
                  .subscribe({
                    next: (unidade) => {
                      this.dadosUnidadeExterna = unidade[0];
                      reject(false);
                    },
                    error: (error) => {
                      reject(false);
                    }
                  });
              }
            },
            error: (error) => {
              reject(false);
            }
          });
      } else {
        resolve(true);
      }
    }).catch(() => {
      this.handleException();
    });
    return promise.then();
  }

  getDecodedAccessToken(token: any): any {
    try {
      return jwt_decode(token);
    } catch (error) {
      return null;
    }
  }

  handleException() {
    if (this.dadosUnidadeExterna) {
      this.alertUtil
        .okModalDialog(
          `
        Usuário sem cadastro no sistema Administra.
        Favor entrar em contato com o administrador do sistema pelos telefones
        (61) 3319- ${this.dadosUnidadeExterna.descRamais} ou pelo e-mail
         ${this.dadosUnidadeExterna.sgUnidade?.toLowerCase()}@stj.jus.br.`
        )
        .then(() => {
          this.authService.logout();
        });
    } else {
      if (!this.isUnidSobResponsabilidade) {
        this.alertUtil
          .okModalDialog(
            `Não foi possível verificar o cadastro do usuário externo. Por favor tente novamente.`
          )
          .then(() => {
            this.authService.logout();
          });
      }
    }
  }

  hasPermission(permission: string[]): boolean {
    let token = this.authService.getStorage().getItem('token');
    let tokenDecode = this.getDecodedAccessToken(token);
    let listAuthorities: string[] = tokenDecode.authorities;
    return (
      listAuthorities?.filter((authority) => permission.includes(authority))
        .length > 0
    );
  }
}
