import { Injectable } from '@angular/core';
import * as Joi from 'joi';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  validateEmail(email: string): string | null {
    const schema = Joi.string().email({ tlds: { allow: false } });
    const { error } = schema.validate(email);
    return error ? error.message : null;
  }

  validatePhone(phone: string): string | null {
    const schema = Joi.string()
      .pattern(/^[0-9]{10}$/)
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits long.',
      });
    const { error } = schema.validate(phone);
    return error ? error.message : null;
  }

  validatePassword(password: string): string | null {
    const schema = Joi.string()
      .min(8)
      .max(20)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
      .messages({
        'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.max': 'Password cannot exceed 20 characters.',
      });
    const { error } = schema.validate(password);
    return error ? error.message : null;
  }
}
