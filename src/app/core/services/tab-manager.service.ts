import { Injectable, ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TabState } from '../models/tab.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TabManagerService {
  private readonly tabs = new BehaviorSubject<TabState[]>([]);
  private readonly activeTabId = new BehaviorSubject<string | null>(null);
  private readonly maxTabs = 10; // Limit for memory management
  private readonly componentRefs = new Map<string, ComponentRef<any>>();
  private readonly STORAGE_KEY = 'angular_multitab_state';

  public tabs$ = this.tabs.asObservable();
  public activeTabId$ = this.activeTabId.asObservable();

  constructor(private readonly router: Router) {
    // Restore tabs from localStorage on initialization
    this.restoreTabsFromStorage();

    // Listen to route changes to update tab titles dynamically
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTabFromRoute();
    });

    // Save tabs to localStorage whenever they change
    this.tabs$.subscribe(() => {
      this.saveTabsToStorage();
    });
  }

  /**
   * Opens a new tab or activates existing one if URL matches
   */
  openTab(title: string, url: string, reuseIfExists: boolean = true): string {
    const existingTab = this.findTabByUrl(url);

    if (existingTab && reuseIfExists) {
      // Reuse existing tab - keep state intact
      this.activateTab(existingTab.id);
      return existingTab.id;
    }

    // Check max tabs limit for memory management
    if (this.tabs.value.length >= this.maxTabs) {
      this.closeOldestInactiveTab();
    }

    // Create new tab
    const newTab: TabState = {
      id: this.generateTabId(),
      title,
      url,
      active: false,
      loaded: false,
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };

    const currentTabs = this.tabs.value;
    this.tabs.next([...currentTabs, newTab]);
    this.activateTab(newTab.id);

    return newTab.id;
  }

  /**
   * Activates a tab and navigates to its URL
   */
  activateTab(tabId: string): void {
    const currentTabs = this.tabs.value;
    const tabIndex = currentTabs.findIndex(t => t.id === tabId);

    if (tabIndex === -1) return;

    // Deactivate all tabs
    const updatedTabs = currentTabs.map(tab => ({
      ...tab,
      active: tab.id === tabId,
      lastAccessedAt: tab.id === tabId ? new Date() : tab.lastAccessedAt
    }));

    this.tabs.next(updatedTabs);
    this.activeTabId.next(tabId);

    // Navigate to tab's URL
    const activeTab = updatedTabs[tabIndex];
    if (activeTab.url !== this.router.url) {
      this.router.navigateByUrl(activeTab.url);
    }

    // Mark as loaded when activated
    this.markTabAsLoaded(tabId);
  }

  /**
   * Closes a tab and cleans up its resources
   */
  closeTab(tabId: string): void {
    const currentTabs = this.tabs.value;
    const tabIndex = currentTabs.findIndex(t => t.id === tabId);

    if (tabIndex === -1) return;

    const wasActive = currentTabs[tabIndex].active;

    // Clean up component reference to prevent memory leak
    this.destroyComponentRef(tabId);

    // Remove tab
    const updatedTabs = currentTabs.filter(t => t.id !== tabId);

    this.tabs.next(updatedTabs);

    // If closed tab was active, activate another tab
    if (wasActive && updatedTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, updatedTabs.length - 1);
      this.activateTab(updatedTabs[newActiveIndex].id);
    } else if (updatedTabs.length === 0) {
      this.activeTabId.next(null);
      this.router.navigate(['/']);
    }
  }

  /**
   * Closes all tabs
   */
  closeAllTabs(): void {
    const currentTabs = this.tabs.value;
    
    // Clean up all component references
    currentTabs.forEach(tab => this.destroyComponentRef(tab.id));

    this.tabs.next([]);
    this.activeTabId.next(null);
    this.router.navigate(['/']);
    
    // Clear stored state when all tabs are closed
    this.clearStoredState();
  }

  /**
   * Closes all tabs except the specified one
   */
  closeOtherTabs(tabId: string): void {
    const currentTabs = this.tabs.value;
    const tabToKeep = currentTabs.find(t => t.id === tabId);

    if (!tabToKeep) return;

    // Clean up all other component references
    currentTabs.forEach(tab => {
      if (tab.id !== tabId) {
        this.destroyComponentRef(tab.id);
      }
    });

    this.tabs.next([tabToKeep]);
    this.activateTab(tabId);
  }

  /**
   * Updates tab title
   */
  updateTabTitle(tabId: string, title: string): void {
    const currentTabs = this.tabs.value;
    const updatedTabs = currentTabs.map(tab =>
      tab.id === tabId ? { ...tab, title } : tab
    );
    this.tabs.next(updatedTabs);
  }

  /**
   * Saves component state for lazy reload
   */
  saveTabState(tabId: string, state: any): void {
    const currentTabs = this.tabs.value;
    const updatedTabs = currentTabs.map(tab =>
      tab.id === tabId ? { ...tab, componentState: state } : tab
    );
    this.tabs.next(updatedTabs);
  }

  /**
   * Gets saved tab state
   */
  getTabState(tabId: string): any {
    const tab = this.tabs.value.find(t => t.id === tabId);
    return tab?.componentState;
  }

  /**
   * Saves scroll position for a tab
   */
  saveScrollPosition(tabId: string, position: number): void {
    const currentTabs = this.tabs.value;
    const updatedTabs = currentTabs.map(tab =>
      tab.id === tabId ? { ...tab, scrollPosition: position } : tab
    );
    this.tabs.next(updatedTabs);
  }

  /**
   * Gets saved scroll position
   */
  getScrollPosition(tabId: string): number {
    const tab = this.tabs.value.find(t => t.id === tabId);
    return tab?.scrollPosition || 0;
  }

  /**
   * Gets active tab
   */
  getActiveTab(): TabState | null {
    return this.tabs.value.find(t => t.active) || null;
  }

  /**
   * Gets all tabs
   */
  getAllTabs(): TabState[] {
    return this.tabs.value;
  }

  /**
   * Registers component reference for cleanup
   */
  registerComponentRef(tabId: string, componentRef: ComponentRef<any>): void {
    // Destroy old component ref if exists
    this.destroyComponentRef(tabId);
    this.componentRefs.set(tabId, componentRef);
  }

  /**
   * Destroys component reference to prevent memory leaks
   */
  private destroyComponentRef(tabId: string): void {
    const componentRef = this.componentRefs.get(tabId);
    if (componentRef) {
      componentRef.destroy();
      this.componentRefs.delete(tabId);
    }
  }

  /**
   * Marks tab as loaded (on-demand loading)
   */
  private markTabAsLoaded(tabId: string): void {
    const currentTabs = this.tabs.value;
    const updatedTabs = currentTabs.map(tab =>
      tab.id === tabId ? { ...tab, loaded: true } : tab
    );
    this.tabs.next(updatedTabs);
  }

  /**
   * Finds tab by URL
   */
  private findTabByUrl(url: string): TabState | undefined {
    return this.tabs.value.find(t => t.url === url);
  }

  /**
   * Closes oldest inactive tab for memory management
   */
  private closeOldestInactiveTab(): void {
    const inactiveTabs = this.tabs.value
      .filter(t => !t.active)
      .sort((a, b) => a.lastAccessedAt.getTime() - b.lastAccessedAt.getTime());

    if (inactiveTabs.length > 0) {
      this.closeTab(inactiveTabs[0].id);
    }
  }

  /**
   * Updates active tab based on current route
   */
  private updateActiveTabFromRoute(): void {
    const currentUrl = this.router.url;
    const matchingTab = this.findTabByUrl(currentUrl);

    if (matchingTab && matchingTab.id !== this.activeTabId.value) {
      this.activateTab(matchingTab.id);
    }
  }

  /**
   * Generates unique tab ID
   */
  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Saves current tabs to localStorage for browser tab duplication support
   */
  private saveTabsToStorage(): void {
    try {
      const currentTabs = this.tabs.value;
      const serializedTabs = currentTabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        active: tab.active,
        loaded: tab.loaded,
        scrollPosition: tab.scrollPosition,
        componentState: tab.componentState,
        createdAt: tab.createdAt.toISOString(),
        lastAccessedAt: tab.lastAccessedAt.toISOString()
      }));

      const state = {
        tabs: serializedTabs,
        activeTabId: this.activeTabId.value,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save tabs to localStorage:', error);
    }
  }

  /**
   * Restores tabs from localStorage on app initialization
   */
  private restoreTabsFromStorage(): void {
    try {
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      if (!storedState) return;

      const state = JSON.parse(storedState);
      
      // Check if state is recent (within last 24 hours)
      const timestamp = new Date(state.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        // Clear old state
        localStorage.removeItem(this.STORAGE_KEY);
        return;
      }

      // Restore tabs
      const restoredTabs: TabState[] = state.tabs.map((tab: any) => ({
        ...tab,
        createdAt: new Date(tab.createdAt),
        lastAccessedAt: new Date(tab.lastAccessedAt)
      }));

      if (restoredTabs.length > 0) {
        this.tabs.next(restoredTabs);
        
        // Restore active tab
        if (state.activeTabId) {
          this.activeTabId.next(state.activeTabId);
          
          // Navigate to the active tab's URL
          const activeTab = restoredTabs.find(t => t.id === state.activeTabId);
          if (activeTab) {
            // Use setTimeout to ensure router is ready
            setTimeout(() => {
              this.router.navigateByUrl(activeTab.url);
            }, 0);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore tabs from localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Clears stored tab state from localStorage
   */
  public clearStoredState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear stored state:', error);
    }
  }
}
