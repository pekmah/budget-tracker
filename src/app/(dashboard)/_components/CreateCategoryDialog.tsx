"use client";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
} from "@/app/schema/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverContent } from "@radix-ui/react-popover";
import { CircleOff, Loader2, PlusSquareIcon } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateCategory } from "../_actions/categories";
import { toast } from "sonner";
import { Category } from "@prisma/client";
import { useTheme } from "next-themes";

interface Props {
  type: TransactionType;
  onSuccessCallback: (category: Category) => void;
}

const CreateCategoryDialog = ({ type, onSuccessCallback }: Props) => {
  const [open, setOpen] = React.useState(false);
  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type,
    },
  });
  const queryClient = useQueryClient();
  const theme = useTheme();

  const createCategoryMutation = useMutation({
    mutationKey: ["create_category"],
    mutationFn: CreateCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      });
      toast.success(`Category ${data.name} created successfully 🎉`, {
        id: "create-category",
      });
      // choses the created category and closes category picker
      onSuccessCallback(data);
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("An error occurred while creating category", {
        id: "create-category",
      });
    },
  });

  const onSubmit = React.useCallback(
    (values: CreateCategorySchemaType) => {
      toast.loading("Creating category...", { id: "create-category" });
      createCategoryMutation.mutate(values);
    },
    [createCategoryMutation]
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="flex border-separate items-center justify-start rounded-none border-b p-3 text-muted-foreground"
        >
          <PlusSquareIcon className="mr-2 h-4 w-4" />
          Create new
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogHeader>
            <DialogTitle>
              Create{" "}
              <span
                className={
                  (cn("m-1"),
                  type === "income" ? "text-emerald-500" : "text-rose-500")
                }
              >
                {type}
              </span>{" "}
              category
            </DialogTitle>

            <DialogDescription>
              Categories are used to group your transactions
            </DialogDescription>
          </DialogHeader>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>

                  <FormControl>
                    <Input defaultValue={""} {...field} />
                  </FormControl>

                  <FormDescription>Category Name (required)</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>

                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full h-[100px]"
                        >
                          {/* check if icon is selected */}
                          {form.watch("icon") ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-4xl">{field.value}</span>

                              <p className="text-xs text-muted-foreground">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOff className="h-10 w-10 " />

                              <p className="text-xs text-muted-foreground">
                                Click to select
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-full">
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) => {
                            field.onChange(emoji.native);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>

                  <FormDescription>Category appearance on app</FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose>
            <Button
              variant={"secondary"}
              type="button"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={createCategoryMutation.isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {createCategoryMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;
