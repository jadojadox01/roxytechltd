export type MenuIconName = "home" | "shop" | "about" | "contact";

export interface MenuItem {
  title: string;
  path?: string;
  icon?: MenuIconName;
  submenu?: MenuItem[];
}
