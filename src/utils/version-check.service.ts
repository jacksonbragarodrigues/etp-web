import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VersionCheckService {
  private storageKey = 'appBuildHash';

  constructor(private http: HttpClient) {}

  versionCheck() {
    this.fetchLatestHash().then((latestHash) => {
      const storedHash = localStorage.getItem(this.storageKey);

      if (!storedHash) {
        localStorage.setItem(this.storageKey, latestHash);
      } else if (storedHash !== latestHash) {
        this.showUpdateNotification(latestHash);
      }
    });
  }

  private async fetchLatestHash(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ version: string }>('assets/version.json', {
          headers: new HttpHeaders({ 'Cache-Control': 'no-cache' }),
          params: { t: Date.now().toString() }, // cache-buster
        })
      );
      return response?.version || '';
    } catch (err) {
      return '';
    }
  }

  private showUpdateNotification(latestHash: string) {
    localStorage.setItem(this.storageKey, latestHash);
    document.dispatchEvent(new CustomEvent('version:changed'));
  }
}
