/**
 * Utility to clean and normalize select data before saving.
 * Handles cases where Formio transforms select data with label, originalData, value, selected fields.
 * Extracts the original data to maintain a clean, consistent data structure.
 */

export class SelectDataCleanerUtil {
  /**
   * Clean form submission data by normalizing select fields.
   * Removes unwanted fields (label, value, selected) and extracts originalData if present.
   *
   * @param data - The form submission data to clean
   * @returns Cleaned data with normalized select fields
   */
  static cleanSelectData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Create a deep copy to avoid mutating the original data
    const cleaned = JSON.parse(JSON.stringify(data));

    // Process all keys in the data object
    Object.keys(cleaned).forEach((key) => {
      const value = cleaned[key];

      if (Array.isArray(value)) {
        // Process array of items (multi-select)
        cleaned[key] = this.cleanSelectArray(value);
      } else if (value && typeof value === 'object') {
        // Process single select item or nested objects
        cleaned[key] = this.cleanSelectItem(value);
      }
    });

    return cleaned;
  }

  /**
   * Clean an array of select items.
   * Removes items that appear to be transformed select options and extracts original data.
   *
   * @param items - Array of items that may contain select options
   * @returns Cleaned array
   */
  private static cleanSelectArray(items: any[]): any[] {
    return items.map((item) => this.cleanSelectItem(item));
  }

  /**
   * Clean a single select item.
   * If item has originalData field, extract it (as it contains the original API response).
   * If item is a select option with value/label/selected, check for originalData.
   * Otherwise, return the item as-is.
   *
   * @param item - The item to clean
   * @returns Cleaned item
   */
  private static cleanSelectItem(item: any): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    // PRIORITY 1: If item has originalData, always use it (it contains the original API response)
    if ('originalData' in item && item.originalData && typeof item.originalData === 'object') {
      return this.deepClone(item.originalData);
    }

    // PRIORITY 2: Check if this looks like a transformed select option
    // (has label, value, selected structure without originalData)
    const isTransformedSelectOption =
      'label' in item && 'value' in item && 'selected' in item && !('originalData' in item);

    if (isTransformedSelectOption) {
      // This is a transformed option but without originalData - might have been partially saved
      // Return as-is since we can't reconstruct the original data
      return item;
    }

    // PRIORITY 3: Check if this has both label/value AND object-like fields (sigla, id, descricao)
    // This means it's a mixed state - return only the object fields
    const hasTransformedFields = 'label' in item && 'value' in item;
    const hasOriginalFields = 'sigla' in item || 'id' in item || 'descricao' in item;

    if (hasTransformedFields && hasOriginalFields) {
      // Extract only the original fields (sigla, id, descricao, etc.)
      const cleaned: any = {};
      const fieldsToKeep = ['sigla', 'id', 'descricao', 'chave', 'nome', 'matricula', 'label'];

      for (const field of fieldsToKeep) {
        if (field in item && !['label', 'value', 'selected', 'originalData'].includes(field)) {
          cleaned[field] = item[field];
        }
      }

      return Object.keys(cleaned).length > 0 ? cleaned : item;
    }

    // PRIORITY 4: For regular objects, return as-is (they are already in the correct format)
    return this.deepClone(item);
  }

  /**
   * Deep clone an object to avoid reference issues
   */
  private static deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }

  /**
   * Check if an item appears to be a transformed select option.
   *
   * @param item - The item to check
   * @returns true if item looks like a transformed select option
   */
  static isTransformedSelectOption(item: any): boolean {
    if (!item || typeof item !== 'object') {
      return false;
    }

    return 'label' in item && 'value' in item && ('originalData' in item || 'selected' in item);
  }

  /**
   * Extract original data from a transformed select option.
   *
   * @param item - The transformed select option
   * @returns Original data if available, otherwise the item itself
   */
  static extractOriginalData(item: any): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    if ('originalData' in item && item.originalData) {
      return item.originalData;
    }

    return item;
  }
}
