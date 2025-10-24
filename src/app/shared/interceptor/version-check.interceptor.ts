import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { VersionCheckService } from '../../../utils/version-check.service';

@Injectable()
export class VersionCheckInterceptor implements HttpInterceptor {
  constructor(private versionCheck: VersionCheckService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes('assets/version.json')) {
      this.versionCheck.versionCheck();
    }

    return next.handle(req);
  }

}
