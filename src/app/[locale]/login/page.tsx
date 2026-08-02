import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth, signIn } from "@/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { PageShell } from "@/components/layout/page-shell";
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
    <PageShell gap="lg" className="items-center justify-center">
      <div className="absolute inset-x-0 top-0 px-4 sm:px-6">
        <SiteHeader brand={t("brand")} showAuth={false} />
      </div>
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("azure-ad", { redirectTo: callbackUrl });
          }}
          className="w-full"
        >
          <Button type="submit" size="lg" className="w-full">
            {t("signIn")}
          </Button>
        </form>
      </div>
    </PageShell>
  );
}
