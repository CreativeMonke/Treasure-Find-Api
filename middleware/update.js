import { check, validationResult } from 'express-validator';

export const validateUpdate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 'failed',
      errors: errors.array().map(err => ({ [err.param]: err.msg })),
    });
  }
  next();
};
