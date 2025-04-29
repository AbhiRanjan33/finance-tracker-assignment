"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()
  
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/transactions"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/transactions") ? "text-primary" : "text-muted-foreground"
        )}
      >
        Transactions
      </Link>
      <Link
        href="/categories"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/categories") ? "text-primary" : "text-muted-foreground"
        )}
      >
        Categories
      </Link>
      <Link
        href="/budgets"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/budgets") ? "text-primary" : "text-muted-foreground"
        )}
      >
        Budgets
      </Link>
    </nav>
  )
}
