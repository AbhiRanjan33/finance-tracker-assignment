import { BudgetForm } from "@/components/budget-form"

export default function BudgetsNewPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Add Budget</h2>
        </div>
        <div className="grid gap-4">
          <BudgetForm />
        </div>
      </div>
    </div>
  )
}