import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth, signIn } from "@/auth";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";

type LoginPageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

function safeCallbackUrl(value: string | undefined, locale: string) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return `/${locale}`;
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const { callbackUrl: rawCallback } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  const callbackUrl = safeCallbackUrl(rawCallback, locale);

  if (session) {
    redirect(callbackUrl);
  }

  const t = await getTranslations("Auth");

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="absolute end-4 top-4 flex items-center gap-2 sm:end-6 sm:top-6">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-8">
        <div className="space-y-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("azure-ad", { redirectTo: callbackUrl });
          }}
        >
          <Button type="submit" size="lg" className="w-full">
            {t("signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
