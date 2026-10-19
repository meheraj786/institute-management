"use client";

import { useState } from "react";
import type { z } from "zod";
import { uploadCloudinaryImage } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Option = { value: string; label: string };
export type FormField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "textarea"
    | "file"
    | "select"
    | "checkbox";
  options?: Option[];
  placeholder?: string;
};

type Props = {
  schema: z.ZodType;
  fields: FormField[];
  submitLabel?: string;
  onSubmit: (value: unknown) => Promise<unknown> | unknown;
};

export function ValidatedForm({
  schema,
  fields,
  submitLabel = "Save record",
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [key, setKey] = useState(0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setFormError("");
    const form = new FormData(formElement);
    const fileField = fields.find((field) => field.type === "file");
    const selectedFile = fileField ? form.get(fileField.name) : null;
    const input = Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.type === "file"
          ? undefined
          : field.type === "checkbox"
            ? form.has(field.name)
            : form.get(field.name) === ""
              ? undefined
              : (form.get(field.name) ?? undefined),
      ]),
    );
    const result = schema.safeParse(input);
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const name = String(issue.path[0] ?? "form");
        nextErrors[name] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const value =
        fileField && selectedFile instanceof File && selectedFile.size > 0
          ? {
              ...(result.data as Record<string, unknown>),
              [fileField.name]: await uploadCloudinaryImage(selectedFile),
            }
          : result.data;
      await onSubmit(value);
      formElement.reset();
      setKey((value) => value + 1);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save this record",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="entity-form" onSubmit={submit} key={key}>
      <div className="form-grid">
        {fields.map((field) => (
          <label
            className={`form-field ${field.type === "textarea" ? "form-field-wide" : ""}`}
            key={field.name}
          >
            <span>{field.label}</span>
            {field.type === "textarea" ? (
              <Textarea name={field.name} placeholder={field.placeholder} />
            ) : field.type === "file" ? (
              <Input name={field.name} type="file" accept="image/*" />
            ) : field.type === "select" ? (
              <Select name={field.name} defaultValue="">
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={`Select ${field.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem value={option.value} key={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === "checkbox" ? (
              <Input name={field.name} type="checkbox" />
            ) : (
              <Input
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
              />
            )}
            {errors[field.name] && (
              <small className="field-error">{errors[field.name]}</small>
            )}
          </label>
        ))}
      </div>
      {formError && <p className="form-error">{formError}</p>}
      <Button disabled={saving} type="submit">
        {saving ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
