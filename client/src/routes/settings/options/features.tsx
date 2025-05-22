import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { featuresEditFormSchema } from "@/types/forms"
import type { TFeaturesEditFormSchema } from "@/types/forms"
import { useFeatures } from "@/contexts/featuresProvider"
import type { FeatureProviderState } from "@/contexts/featuresProvider"

export function FeaturesOptions() {
  const { features, setFeatures } = useFeatures()
  return (
      <>
    <div>
      <div className="p-2">
        {Object.keys(features).length === 0 ? <>
          No Features are currently available to modify
        </> : <FeaturesEditForm features={features} setFeatures={setFeatures} />}
      </div>
    </div>
  </>
  )
}

function FeaturesEditForm({
  features,
  setFeatures
}: Pick<FeatureProviderState, "features" | "setFeatures">) {
  const featuresEditForm = useForm<TFeaturesEditFormSchema>({
    resolver: zodResolver(featuresEditFormSchema),
    defaultValues: features,
  })

  async function handleFeaturesUpdate(values: TFeaturesEditFormSchema) {
    try {
      await setFeatures(values)
      toast.success("Features updated successfully")
      featuresEditForm.reset(values)
    } catch (err) {
      if (import.meta.env.DEV)
        console.error("An error occurred while changing the features", err)
      toast.error((err instanceof Error) ? err.message : "Failed to Update Features")
    }
  }

  return (
    <Form {...featuresEditForm}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form className="grid gap-2" onSubmit={featuresEditForm.handleSubmit(handleFeaturesUpdate)}>
        <FormField
          control={featuresEditForm.control}
          name="GEN_AI"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Generative AI</FormLabel>
              <FormControl>
                <Switch
                  className="!mt-0 float-end"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Features that use Generative AI for their functionality.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {featuresEditForm.formState.isDirty && <div className="flex gap-2 my-2">
          <Button type="submit" title="Update">Update</Button>
          <Button
            onClick={() => featuresEditForm.reset()}
            type="button"
            title="Cancel"
            variant="outline"
          >Cancel</Button>
        </div>}
      </form>
    </Form>
  )
}

export default FeaturesOptions
