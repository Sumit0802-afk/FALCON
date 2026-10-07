import { Router } from "express";
import { z } from "zod";
import { emailTemplateController, userEmailTemplateController } from "../controllers/emailTemplate.controller";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { emailSendRateLimit, emailTestRateLimit } from "../middleware/rateLimit.middleware";

// ─── Library: /api/email-templates ────────────────────────────────────────────

const router = Router();

router.get("/", optionalAuth, emailTemplateController.list);
router.get("/search", optionalAuth, emailTemplateController.list);
router.get("/categories", emailTemplateController.categories);
router.get("/recent", requireAuth, emailTemplateController.recent);
router.get("/:id/thumbnail.svg", emailTemplateController.thumbnail);
router.get("/:id", optionalAuth, emailTemplateController.get);
router.post("/:id/use", requireAuth, emailTemplateController.use);
router.post("/:id/favorite", requireAuth, emailTemplateController.favorite);
router.delete("/:id/favorite", requireAuth, emailTemplateController.unfavorite);

export default router;

// ─── A user's own designs: /api/user/email-templates ──────────────────────────

const documentSchema = z.record(z.any());

const createSchema = z.object({
  name: z.string().max(120).optional(),
  templateData: documentSchema.optional(),
});

const updateSchema = z
  .object({
    name: z.string().max(120).optional(),
    templateData: documentSchema.optional(),
  })
  .refine((body) => body.name !== undefined || body.templateData !== undefined, {
    message: "Provide a name or templateData to update",
  });

const sendTestSchema = z.object({
  templateData: documentSchema,
  subject: z.string().max(200).optional(),
});

const address = z.string().trim().toLowerCase().max(254).email("Enter valid email addresses");

const sendSchema = z.object({
  to: z.array(address).min(1, "Add at least one recipient").max(25),
  cc: z.array(address).max(25).optional(),
  bcc: z.array(address).max(25).optional(),
  subject: z.string().trim().min(1, "A subject is required").max(200),
  html: z.string().min(1).max(600_000, "This email is too large to send"),
  fromName: z.string().max(80).optional(),
  replyTo: address.optional(),
  /** Send the design as a picture of itself, so it arrives exactly as made */
  exact: z.boolean().optional(),
});

export const userEmailTemplateRoutes = Router();
userEmailTemplateRoutes.use(requireAuth);

userEmailTemplateRoutes.get("/", userEmailTemplateController.list);
userEmailTemplateRoutes.post("/", validateBody(createSchema), userEmailTemplateController.create);
userEmailTemplateRoutes.post("/send", emailSendRateLimit, validateBody(sendSchema), userEmailTemplateController.send);
userEmailTemplateRoutes.post("/send-test", emailTestRateLimit, validateBody(sendTestSchema), userEmailTemplateController.sendTest);
userEmailTemplateRoutes.get("/:id", userEmailTemplateController.get);
userEmailTemplateRoutes.put("/:id", validateBody(updateSchema), userEmailTemplateController.update);
userEmailTemplateRoutes.delete("/:id", userEmailTemplateController.remove);
userEmailTemplateRoutes.post("/:id/duplicate", userEmailTemplateController.duplicate);

// ─── Generated artwork: /api/email-assets ─────────────────────────────────────

export const emailAssetRoutes = Router();
emailAssetRoutes.get("/art/:style/:colors/:seed/:size", emailTemplateController.art);
