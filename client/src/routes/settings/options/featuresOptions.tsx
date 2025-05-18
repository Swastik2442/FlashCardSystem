/* eslint-disable @typescript-eslint/no-misused-promises */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { roles2features, features2roleChanges } from "@/featureFlags";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { featuresEditFormSchema } from "@/types/forms";
import type { TFeaturesEditFormSchema } from "@/types/forms";
import { getPossibleUserRoles, getUserRoles, setUserRoles } from "@/api/user";

interface IFeaturesOptionsData {
    readonly possibleRoles: string[],
    currentRoles: string[]
}

export async function FeaturesOptionsLoader(): Promise<IFeaturesOptionsData> {
  const possibleRoles = await getPossibleUserRoles();
  const currentRoles = await getUserRoles();
  return { possibleRoles, currentRoles };
}

export function FeaturesOptions({ data }: { data: IFeaturesOptionsData }) {
  return (
      <>
    <div>
      <div className="p-2">
        {data.possibleRoles.length == 0 ? <>
          No Features are currently available to modify
        </> : <FeaturesEditForm data={data} />}
      </div>
    </div>
  </>
  )
}

function FeaturesEditForm({ data }: { data: IFeaturesOptionsData }) {
  const navigate = useNavigate();
  const featuresEditForm = useForm<TFeaturesEditFormSchema>({
    resolver: zodResolver(featuresEditFormSchema),
    defaultValues: useMemo(
      () => roles2features(data.currentRoles, data.possibleRoles),
      [data.currentRoles, data.possibleRoles]
    ),
  });

  async function handleFeaturesUpdate(values: TFeaturesEditFormSchema) {
    try {
      await setUserRoles(features2roleChanges(values, data.possibleRoles));
      toast.success("User updated successfully");
      featuresEditForm.reset({}, { keepDirtyValues: true });
      await navigate(0);
    } catch (err) {
      console.error(err);
      toast.error((err instanceof Error) ? err.message : "Failed to Update User");
    }
  }

  return (
    <Form {...featuresEditForm}>
      <form className="grid gap-2" onSubmit={featuresEditForm.handleSubmit(handleFeaturesUpdate)}>
        <FormField
          control={featuresEditForm.control}
          name="genAI"
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
  );
}

export default FeaturesOptions;
