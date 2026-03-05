import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const animalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  animal_type: z.enum(["cow", "chicken", "goat", "pig", "dog"]),
  breed: z.string().optional(),
  age_months: z.coerce.number().min(0).optional(),
  weight_kg: z.coerce.number().min(0).optional(),
  tag_number: z.string().optional(),
  notes: z.string().optional(),
});

export const deviceClaimSchema = z.object({
  device_serial: z.string().min(1, "Serial number is required"),
  animal_id: z.coerce.number().optional(),
});

export const adminUserCreateSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  email: z.string().email(),
  password: z.string().min(8, "Password min 8 chars"),
  role: z.enum(["admin", "farmer"]),
});

export const deviceRegisterSchema = z.object({
  device_serial: z.string().min(1, "Serial is required"),
  device_type: z.enum(["collar", "ear_tag", "ankle_band"]),
  firmware_version: z.string().optional(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AnimalInput = z.infer<typeof animalSchema>;
export type DeviceClaimInput = z.infer<typeof deviceClaimSchema>;
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
export type DeviceRegisterInput = z.infer<typeof deviceRegisterSchema>;
