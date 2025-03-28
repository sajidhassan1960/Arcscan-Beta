"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

// Form schema
const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Please select an industry.",
  }),
  region: z.string().min(2, {
    message: "Please select a primary region.",
  }),
  supplyChainConcern: z.string().optional(),
})

interface BusinessFormProps {
  onSubmit: (data: any) => void
}

export function BusinessForm({ onSubmit }: BusinessFormProps) {
  const [formProgress, setFormProgress] = useState(0)

  // Ensure the form always has defined values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      region: "",
      supplyChainConcern: "",
    },
  })

  // Update progress when form values change
  const watchedValues = form.watch()

  // Calculate form progress
  const calculateProgress = () => {
    const fields = ["companyName", "industry", "region"]
    const fieldsCompleted = fields.filter((field) => !!watchedValues[field as keyof typeof watchedValues]).length

    return Math.round((fieldsCompleted / fields.length) * 100)
  }

  // Update progress when form values change
  useEffect(() => {
    setFormProgress(calculateProgress())
  }, [watchedValues])

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values)
  }

  // Industry categories with subcategories
  const industries = [
    {
      category: "Manufacturing",
      options: [
        { value: "automotive", label: "Automotive" },
        { value: "electronics", label: "Electronics & Semiconductors" },
        { value: "industrial", label: "Industrial Equipment" },
        { value: "aerospace", label: "Aerospace & Defense" },
        { value: "chemicals", label: "Chemicals & Materials" },
      ],
    },
    {
      category: "Consumer Goods",
      options: [
        { value: "food", label: "Food & Beverage" },
        { value: "apparel", label: "Apparel & Textiles" },
        { value: "consumer_electronics", label: "Consumer Electronics" },
        { value: "personal_care", label: "Personal Care & Cosmetics" },
        { value: "furniture", label: "Furniture & Home Goods" },
      ],
    },
    {
      category: "Healthcare",
      options: [
        { value: "pharmaceuticals", label: "Pharmaceuticals" },
        { value: "medical_devices", label: "Medical Devices" },
        { value: "biotechnology", label: "Biotechnology" },
        { value: "healthcare_services", label: "Healthcare Services" },
      ],
    },
    {
      category: "Technology",
      options: [
        { value: "software", label: "Software & IT Services" },
        { value: "hardware", label: "Hardware & Equipment" },
        { value: "telecommunications", label: "Telecommunications" },
        { value: "cloud_services", label: "Cloud Services" },
      ],
    },
    {
      category: "Energy & Resources",
      options: [
        { value: "oil_gas", label: "Oil & Gas" },
        { value: "mining", label: "Mining & Metals" },
        { value: "utilities", label: "Utilities" },
        { value: "renewable_energy", label: "Renewable Energy" },
      ],
    },
    {
      category: "Retail & Distribution",
      options: [
        { value: "retail", label: "Retail" },
        { value: "ecommerce", label: "E-commerce" },
        { value: "wholesale", label: "Wholesale Distribution" },
        { value: "logistics", label: "Logistics & Transportation" },
      ],
    },
  ]

  // Regions with subregions
  const regions = [
    {
      category: "North America",
      options: [
        { value: "us", label: "United States" },
        { value: "canada", label: "Canada" },
        { value: "mexico", label: "Mexico" },
      ],
    },
    {
      category: "Europe",
      options: [
        { value: "western_europe", label: "Western Europe" },
        { value: "eastern_europe", label: "Eastern Europe" },
        { value: "northern_europe", label: "Northern Europe" },
        { value: "southern_europe", label: "Southern Europe" },
      ],
    },
    {
      category: "Asia Pacific",
      options: [
        { value: "east_asia", label: "East Asia" },
        { value: "southeast_asia", label: "Southeast Asia" },
        { value: "south_asia", label: "South Asia" },
        { value: "australia_nz", label: "Australia & New Zealand" },
      ],
    },
    {
      category: "Latin America",
      options: [
        { value: "brazil", label: "Brazil" },
        { value: "central_america", label: "Central America" },
        { value: "south_america", label: "South America (excl. Brazil)" },
        { value: "caribbean", label: "Caribbean" },
      ],
    },
    {
      category: "Middle East & Africa",
      options: [
        { value: "middle_east", label: "Middle East" },
        { value: "north_africa", label: "North Africa" },
        { value: "sub_saharan_africa", label: "Sub-Saharan Africa" },
      ],
    },
    {
      category: "Global",
      options: [
        { value: "global", label: "Global Operations" },
        { value: "multi_regional", label: "Multi-Regional" },
      ],
    },
  ]

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
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Provide essential information to receive a tailored supply chain risk assessment
          </CardDescription>
          <div className="h-2 mt-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 ease-in-out"
              style={{ width: `${formProgress}%` }}
            ></div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Gher- The Taste Of Sundarbans"
                          {...field}
                          className="focus-visible:ring-amber-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-amber-500">
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {industries.map((industryGroup) => (
                            <div key={industryGroup.category}>
                              <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50">
                                {industryGroup.category}
                              </div>
                              {industryGroup.options.map((industry) => (
                                <SelectItem key={industry.value} value={industry.value}>
                                  {industry.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Operating Region</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-amber-500">
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {regions.map((regionGroup) => (
                            <div key={regionGroup.category}>
                              <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50">
                                {regionGroup.category}
                              </div>
                              {regionGroup.options.map((region) => (
                                <SelectItem key={region.value} value={region.value}>
                                  {region.label}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplyChainConcern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        More About Company
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Optional: Add information like what this company does.. and stuffs </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="E.g., 'Largest Soft Shell crab producer in Bangladesh'"
                          className="resize-none h-20 focus-visible:ring-amber-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Optional: Helps us focus the analysis on your specific needs</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Continue
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

