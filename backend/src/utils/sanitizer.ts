/**
 * Sanitizer Utility - Protection XSS
 *
 * Principe: Never trust user input
 *
 * Note: Drizzle ORM protege deja contre SQL Injection.
 * Ce sanitizer se concentre sur XSS (balises HTML dangereuses).
 */

export class Sanitizer {
  /**
   * Supprime les balises HTML
   */
  static stripHtml(input: string): string {
    if (typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Nettoie un email
   */
  static cleanEmail(email: string): string {
    if (typeof email !== 'string') return '';
    return email.toLowerCase().trim();
  }

  /**
   * Nettoie un username (alphanum + underscore uniquement)
   */
  static cleanUsername(username: string): string {
    if (typeof username !== 'string') return '';
    return username.replace(/[^a-zA-Z0-9_]/g, '').trim();
  }

  /**
   * Sanitize un objet récursivement
   * Applique stripHtml sur toutes les strings
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const result = {} as T;

    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'string') {
        result[key] = this.stripHtml(value) as any;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = this.sanitizeObject(value);
      } else if (Array.isArray(value)) {
        const arr = [];
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === 'string') {
            arr.push(this.stripHtml(value[i]));
          } else {
            arr.push(value[i]);
          }
        }
        result[key] = arr as any;
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

/**
 * Helper: sanitize les champs courants d'une requête
 */
export function sanitizeRequestBody(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in data) {
    const value = data[key];

    // Email: lowercase
    if (key === 'email' && typeof value === 'string') {
      result[key] = Sanitizer.cleanEmail(value);
    }
    // Username: alphanum
    else if (key === 'username' && typeof value === 'string') {
      result[key] = Sanitizer.cleanUsername(value);
    }
    // Strings: strip HTML
    else if (typeof value === 'string') {
      result[key] = Sanitizer.stripHtml(value);
    }
    // Autres types: inchangés
    else {
      result[key] = value;
    }
  }

  return result;
}