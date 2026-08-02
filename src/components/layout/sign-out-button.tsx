import { getLocale, getTranslations } from "next-intl/server";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  name?: string | null;
  email?: string | null;
};

export async function SignOutButton({ name, email }: SignOutButtonProps) {
  const t = await getTranslations("Auth");
  const locale = await getLocale();
  const label = name || email || t("account");

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline"
        title={email ?? undefined}
      >
        {label}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: `/${locale}/login` });
        }}
      >
        <Button type="submit" variant="ghost" size="sm">
          {t("signOut")}
        </Button>
      </form>
    </div>
  );
}
