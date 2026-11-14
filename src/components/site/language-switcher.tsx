"use client";

import { ChevronDown } from "lucide-react";
import { languageNames, languageShort } from "@/data/site";
import { useLanguage } from "@/lib/i18n";
import { languages } from "@/types/portfolio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, copy, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 px-2 font-mono text-[11px] uppercase tracking-[0.06em]"
          type="button"
          aria-label={copy.footer.language}
        >
          {languageShort[language]}
          <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((item) => (
          <DropdownMenuItem key={item} onSelect={() => setLanguage(item)} checked={item === language}>
            <span className="flex-1">{languageNames[item]}</span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {languageShort[item]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
