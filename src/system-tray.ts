export interface TrayMenuItem {
  label: string;
  action: () => void;
  enabled?: boolean;
  checked?: boolean;
  type?: 'normal' | 'separator' | 'checkbox';
  submenu?: TrayMenuItem[];
}

export interface TrayConfig {
  icon: string;
  tooltip: string;
  menu: TrayMenuItem[];
}

export class SystemTrayManager {
  private config: TrayConfig;
  private visible = false;

  show(): void { this.visible = true; }
  hide(): void { this.visible = false; }
  updateTooltip(text: string): void { this.config.tooltip = text; }
  updateIcon(icon: string): void { this.config.icon = icon; }
  setMenu(menu: TrayMenuItem[]): void { this.config.menu = menu; }
}
