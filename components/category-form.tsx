"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  icon: z.string({
    required_error: "Please select or enter an icon.",
  }),
  customIcon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Color must be a valid hex code (e.g., #FFFFFF).",
  }),
})

export function CategoryForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "", // Ensure this is always a string
      icon: "",
      customIcon: "", // Ensure this is always a string
      color: "#000000",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const finalIcon = values.icon === "other" ? values.customIcon : values.icon
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        description: values.description || "", // Ensure undefined is converted to empty string
        icon: finalIcon || "",
        color: values.color,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      toast.success("Category added", {
        description: `Added category: ${values.name}`,
      })
      router.push("/categories")
    } else {
      toast.error(result.error || "Failed to add category")
    }
  }

  const handleIconChange = (value: string) => {
    form.setValue("icon", value)
    if (value !== "other") {
      form.setValue("customIcon", "")
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value
    form.setValue("color", hexColor)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Food, Housing" {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of the category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional description"
                  {...field}
                  value={field.value ?? ""} // Ensure value is never undefined
                />
              </FormControl>
              <FormDescription>
                Provide an optional description for the category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={handleIconChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="🍔">🍔 (Food)</SelectItem>
                  <SelectItem value="🏠">🏠 (Housing)</SelectItem>
                  <SelectItem value="🚗">🚗 (Transportation)</SelectItem>
                  <SelectItem value="🎬">🎬 (Entertainment)</SelectItem>
                  <SelectItem value="💡">💡 (Utilities)</SelectItem>
                  <SelectItem value="🛍️">🛍️ (Shopping)</SelectItem>
                  <SelectItem value="💰">💰 (Income)</SelectItem>
                  <SelectItem value="other">Other (Custom)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select an icon to represent the category.
              </FormDescription>
              {form.watch("icon") === "other" && (
                <FormField
                  control={form.control}
                  name="customIcon"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter custom icon (e.g., 😊)"
                          {...field}
                          value={field.value ?? ""} // Ensure value is never undefined
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a custom icon (e.g., an emoji).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input
                  type="color"
                  value={field.value}
                  onChange={handleColorChange}
                  className="w-12 h-12 p-1"
                />
              </FormControl>
              <FormDescription>
                Choose a color for the category (hex code).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">Save Category</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}