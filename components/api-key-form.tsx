"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react"
import { motion } from "framer-motion"

// Form schema
const formSchema = z.object({
  apiKey: z.string().min(10, {
    message: "API key must be at least 10 characters.",
  }),
  apiProvider: z.enum(["gemini"]),
})

// Form schema for Serper API
const serperFormSchema = z.object({
  serperApiKey: z.string().min(10, {
    message: "Serper API key must be at least 10 characters.",
  }),
})

interface ApiKeyFormProps {
  title: string
  description: string
  type: "ai" | "serper"
  onSubmit: (data: any) => void
  onBack: () => void
  initialData?: any
}

export function ApiKeyForm({ title, description, type, onSubmit, onBack, initialData = {} }: ApiKeyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the appropriate schema based on the form type
  const schema = type === "ai" ? formSchema : serperFormSchema

  // Set default values based on form type
  const defaultValues =
    type === "ai"
      ? { apiKey: initialData?.apiKey || "", apiProvider: "gemini" }
      : { serperApiKey: initialData?.serperApiKey || "" }

  // Create form
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(type === "ai"
        ? { apiKey: initialData?.apiKey || "", apiProvider: "gemini" }
        : { serperApiKey: initialData?.serperApiKey || "" }),
    },
  })

  // Handle form submission
  function handleSubmit(values: z.infer<typeof schema>) {
    setIsSubmitting(true)

    // Simulate API key validation
    setTimeout(() => {
      setIsSubmitting(false)
      onSubmit(values)
    }, 500)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="w-full shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-white">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {type === "ai" ? (
                <>
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <KeyRound className="h-4 w-4 mr-2 text-amber-500" />
                          Google Gemini API Key
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your Gemini API key"
                            {...field}
                            type="password"
                            className="focus-visible:ring-amber-500"
                          />
                        </FormControl>
                        <FormDescription>Your API key is stored locally and never sent to our servers.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="serperApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <KeyRound className="h-4 w-4 mr-2 text-amber-500" />
                        Serper API Key
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your Serper API key"
                          {...field}
                          type="password"
                          className="focus-visible:ring-amber-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Required for web search capabilities. Get a key at{" "}
                        <a
                          href="https://serper.dev"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:underline"
                        >
                          serper.dev
                        </a>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack} className="text-gray-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700">
                  {isSubmitting ? "Validating..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

