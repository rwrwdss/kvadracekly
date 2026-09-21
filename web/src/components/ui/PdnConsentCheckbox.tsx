"use client";

import Link from "next/link";
import { SITE } from "@/data/site";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  error?: string;
};

/** Обязательное согласие на ПДн + cookies со ссылкой на политику. */
export function PdnConsentCheckbox({ checked, onChange, id = "pdn-consent", error }: Props) {
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="flex items-start gap-2.5 text-[12px] text-mute leading-relaxed cursor-pointer"
      >
        <input
          id={id}
          type="checkbox"
          name="pdnConsent"
          checked={checked}
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          className="mt-0.5 size-4 shrink-0 accent-[var(--accent)] border border-[var(--border-subtle)]"
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          Соглашаюсь на обработку персональных данных и использование cookies в соответствии с{" "}
          <Link
            href={SITE.legal.privacyPath}
            className="text-accent hover:underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Политикой обработки ПДн
          </Link>
          <span className="text-[var(--diff-hard)]" aria-hidden>
            {" "}
            *
          </span>
        </span>
      </label>
      {error ? (
        <p className="text-[11px] text-[var(--diff-hard)] pl-6" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
