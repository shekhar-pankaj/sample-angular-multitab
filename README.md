# Angular Multi-Tab Manager

A comprehensive Angular application for managing Customers, Products, and Orders with an advanced multi-tab system that allows users to work with multiple views simultaneously in the same window.

## 🎯 Features

### Multi-Tab Management
- **Virtual Tabs**: Open multiple pages in tabs within the same window
- **State Preservation**: Each tab maintains its own state and scroll position
- **Smart Tab Reuse**: Duplicate URLs reuse existing tabs to maintain state
- **On-Demand Loading**: Tabs load content only when activated
- **Memory Leak Prevention**: Automatic cleanup of component references
- **Tab Limit**: Maximum 10 tabs with automatic closure of oldest inactive tabs

### Business Features
- **Customer Management**: View customer list and detailed information
- **Product Catalog**: Browse products with details and pricing
- **Order System**: Track orders with customer and product relationships
- **Cross-Navigation**: Seamlessly navigate between related entities in new tabs

## 🏗️ Architecture

### Core Components

#### 1. Tab Manager Service (`tab-manager.service.ts`)
The heart of the multi-tab system that handles:
- Tab lifecycle management (create, activate, close)
- State preservation and restoration
- Memory management and leak prevention
- URL-based tab deduplication
- Component reference tracking for cleanup

**Key Methods:**
```typescript
openTab(title: string, url: string, reuseIfExists: boolean): string
activateTab(tabId: string): void
closeTab(tabId: string): void
saveTabState(tabId: string, state: any): void
getTabState(tabId: string): any
```

**Memory Management Features:**
- Limits maximum tabs to 10
- Automatically closes oldest inactive tabs
- Destroys component references on tab close
- Cleans up RxJS subscriptions

#### 2. Tab State Model (`tab.model.ts`)
```typescript
interface TabState {
  id: string;
  title: string;
  url: string;
  active: boolean;
  loaded: boolean;
  scrollPosition?: number;
  componentState?: any;
  createdAt: Date;
  lastAccessedAt: Date;
}
```

### Feature Modules

#### Customer Module
- **Customer List**: Display all customers with order counts
- **Customer Detail**: Show detailed customer information
- Components use lazy loading for optimal performance

#### Product Module
- **Product List**: Browse all products with pricing
- **Product Detail**: View complete product specifications
- Category-based filtering support

#### Order Module
- **Order List**: View all orders or filter by customer
- **Order Detail**: Complete order information with items
- Links to related customers and products open in new tabs

### Routing Strategy

**Lazy Loading**: All feature modules are lazy-loaded to improve initial load time and reduce bundle size.

```typescript
{
  path: 'customers',
  loadChildren: () => import('./features/customer/customer.module')
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI (17.x)

### Installation

1. Navigate to project directory:
```bash
cd sample-angular-multitab
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

4. Open browser to `http://localhost:4200`

## 📖 How to Use

### Opening Tabs
1. Click on **Customers**, **Products**, or **Orders** in the navigation bar
2. Click on any row in a list to open details in a new tab
3. Click on linked entities (e.g., customer name in orders) to open related details

### Managing Tabs
- **Switch Tabs**: Click on any tab in the tab bar
- **Close Tab**: Click the × button on a tab
- **Close All**: Click "Close All" in the navigation bar
- **Duplicate URLs**: Opening the same URL reuses the existing tab

### Tab Behavior
- **State Preservation**: Tabs maintain their state when switching between them
- **On-Demand Loading**: Content loads when you first activate a tab
- **Smart Reuse**: Same URLs share tabs to keep state consistent
- **Auto-Cleanup**: Old inactive tabs close when the limit is reached

## 🔧 Technical Implementation

### Memory Leak Prevention

1. **Component Reference Cleanup**:
```typescript
private destroyComponentRef(tabId: string): void {
  const componentRef = this.componentRefs.get(tabId);
  if (componentRef) {
    componentRef.destroy();
    this.componentRefs.delete(tabId);
  }
}
```

2. **RxJS Subscription Management**:
All components use `takeUntil` pattern with destroy$ Subject:
```typescript
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

3. **Tab Limit Enforcement**:
Automatically closes oldest inactive tabs when limit is reached.

### State Management

**Tab State Preservation**:
```typescript
// Save state
this.tabManager.saveTabState(tabId, { data, filters, page });

// Restore state
const savedState = this.tabManager.getTabState(tabId);
```

**Scroll Position Tracking**:
```typescript
// Save scroll position before deactivation
this.tabManager.saveScrollPosition(tabId, scrollTop);

// Restore on reactivation
const position = this.tabManager.getScrollPosition(tabId);
```

### Lazy Loading Implementation

Modules are loaded on-demand using Angular's lazy loading:
```typescript
{
  path: 'customers',
  loadChildren: () => import('./features/customer/customer.module')
    .then(m => m.CustomerModule)
}
```

Benefits:
- Reduced initial bundle size
- Faster application startup
- Better resource utilization

## 🎨 UI/UX Features

- **Clean Tab Interface**: Browser-like tab bar with close buttons
- **Active Tab Indication**: Visual highlighting of the current tab
- **Hover Effects**: Interactive feedback on all clickable elements
- **Responsive Tables**: Easy-to-read data presentation
- **Status Colors**: Visual indicators for order status
- **Loading States**: Smooth loading indicators
- **Empty States**: Helpful messages when no data exists

## 📁 Project Structure

```
sample-angular-multitab/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── models/
│   │   │   │   └── tab.model.ts
│   │   │   └── services/
│   │   │       └── tab-manager.service.ts
│   │   ├── features/
│   │   │   ├── customer/
│   │   │   │   ├── customer-list/
│   │   │   │   ├── customer-detail/
│   │   │   │   ├── models/
│   │   │   │   ├── services/
│   │   │   │   ├── customer.module.ts
│   │   │   │   └── customer-routing.module.ts
│   │   │   ├── product/
│   │   │   │   └── [similar structure]
│   │   │   └── order/
│   │   │       └── [similar structure]
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── styles.scss
│   ├── main.ts
│   └── index.html
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Best Practices Implemented

1. **Separation of Concerns**: Clear separation between core, features, and shared modules
2. **Dependency Injection**: Services provided at root or module level
3. **Reactive Programming**: RxJS for asynchronous operations
4. **Type Safety**: Full TypeScript typing throughout
5. **Memory Management**: Proper cleanup of resources
6. **Lazy Loading**: Optimal bundle sizes with code splitting
7. **Component Communication**: Service-based state management
8. **Routing**: Clean URL structure with parameter support

## 🚨 Key Solutions to Requirements

### ✅ Virtual Tabs for Same Window
- Implemented custom tab bar with TabManagerService
- Uses Angular Router for navigation within tabs

### ✅ Compare Multiple Items
- Open multiple detail pages side by side
- Easy switching between tabs

### ✅ Duplicate URL State Management
- `reuseIfExists` flag preserves existing tab state
- Same URL always reuses the same tab instance

### ✅ Route and History Preservation
- Each tab maintains its own route
- Browser back/forward buttons work correctly
- Tab state persists when switching

### ✅ Memory Leak Prevention
- Component reference cleanup on tab close
- RxJS subscription cleanup with takeUntil
- Maximum tab limit with auto-cleanup
- Proper OnDestroy lifecycle implementation

### ✅ On-Demand Loading
- Lazy loading for feature modules
- Content loads only when tab is activated
- `loaded` flag tracks tab initialization

## 🔮 Future Enhancements

- [ ] Persist tabs in localStorage/sessionStorage
- [ ] Drag-and-drop tab reordering
- [ ] Pin important tabs
- [ ] Tab groups/workspaces
- [ ] Keyboard shortcuts for tab navigation
- [ ] Context menu on tabs (close others, close all right, etc.)
- [ ] Tab history with undo close
- [ ] Search within tabs

## 📝 License

This project is created for demonstration purposes.

## 👤 Author

Created as a sample Angular multi-tab application demonstrating advanced state management and memory optimization techniques.
