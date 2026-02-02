import { z } from "zod";

export const resumeSchema = z.object({
  basics: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    summary: z.string().optional().or(z.literal("")),
  }),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string(),
    dates: z.string().optional().or(z.literal("")),
    details: z.array(z.string()).default([]),
  })).default([]),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    dates: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    bullets: z.array(z.string()).default([]),
  })).default([]),
  skills: z.array(z.object({
    group: z.string(),
    items: z.array(z.string()).default([]),
  })).default([]),
});

export type ResumeData = z.infer<typeof resumeSchema>;
