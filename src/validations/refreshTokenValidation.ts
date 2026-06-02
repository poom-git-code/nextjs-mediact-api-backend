import Joi from "joi";

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.base": "Refresh token must be a string.",
    "any.required": "Refresh token is required.",
  }),
});

export const revokeRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.base": "Refresh token must be a string.",
    "any.required": "Refresh token is required.",
  }),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().optional().messages({
    "string.base": "Refresh token must be a string.",
  }),
});
