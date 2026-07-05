import { routing } from "@/i18n/routing";
import messages from "./messages/en.json";

// Typed locales + message keys for next-intl (autocomplete in t("..."))
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
