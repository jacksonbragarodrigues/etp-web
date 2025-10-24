import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface HelpContent {
  title: string;
  content: string;
  componentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class HelpContentService {
  private helpContentSubject = new BehaviorSubject<HelpContent | null>(null);
  private isHelpPanelOpenSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  /**
   * Observable for current help content
   */
  get helpContent$(): Observable<HelpContent | null> {
    return this.helpContentSubject.asObservable();
  }

  /**
   * Observable for help panel open state
   */
  get isHelpPanelOpen$(): Observable<boolean> {
    return this.isHelpPanelOpenSubject.asObservable();
  }

  /**
   * Show help content in the help panel
   */
  showHelpContent(title: string, content: string, componentId: string): void {
    this.helpContentSubject.next({
      title,
      content,
      componentId
    });
    this.isHelpPanelOpenSubject.next(true);
  }

  /**
   * Hide help panel
   */
  hideHelpContent(): void {
    this.helpContentSubject.next(null);
    this.isHelpPanelOpenSubject.next(false);
  }

  /**
   * Get current help content
   */
  getCurrentHelpContent(): HelpContent | null {
    return this.helpContentSubject.value;
  }

  /**
   * Check if help panel is open
   */
  isHelpPanelOpen(): boolean {
    return this.isHelpPanelOpenSubject.value;
  }
}
