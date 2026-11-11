"use client";

import { Check, ChevronDown } from "lucide-react";
import { languageNames, languageShort } from "@/data/site";
import { useLanguage } from "@/lib/i18n";
import { languages } from "@/types/portfolio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { language, copy, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="lang-trigger" type="button" aria-label={copy.footer.language}>
          {languageShort[language]}
          <ChevronDown width={12} height={12} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((item) => (
          <DropdownMenuItem key={item} onSelect={() => setLanguage(item)}>
            <span>{languageNames[item]}</span>
            <span>
              {languageShort[item]}
              {item === language ? <Check width={12} height={12} aria-hidden="true" /> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
