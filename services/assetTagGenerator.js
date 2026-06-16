/**
 * Asset Tag Generator Service
 * Generates unique, sequential asset tags based on category and subtype
 */

const { Op } = require('sequelize');

// Asset tag prefix mapping by category and sub_type
const assetTagPrefixes = {
  IT: {
    'Laptop': 'LAP',
    'Desktop': 'DES',
    'Monitor': 'MON',
    'Keyboard': 'KBD',
    'Mouse': 'MOU',
    'Printer': 'PRT',
    'Scanner': 'SCN',
    'Router': 'RTR',
    'Switch': 'SWT',
    'UPS': 'UPS',
    'Projector': 'PROJ',
    'Webcam': 'WEB',
    'Headset': 'HED',
    'Mobile': 'MOB',
    'Tablet': 'TAB',
    'Software License': 'SWL',
    'Other': 'IT-OTH'
  },
  'Non-IT': {
    'Chair': 'CHR',
    'Desk': 'DES',
    'Cupboard': 'CUP',
    'Whiteboard': 'WHI',
    'Shelf': 'SHF',
    'Cabinet': 'CAB',
    'Table': 'TBL',
    'Sofa': 'SOF',
    'Fan': 'FAN',
    'Lamp': 'LAM',
    'Other': 'NIT-OTH'
  }
};

/**
 * Get the prefix for a given category and subtype
 * @param {string} category - Asset category ('IT' or 'Non-IT')
 * @param {string} subType - Asset subtype
 * @returns {string|null} The prefix or null if not found
 */
const getPrefix = (category, subType) => {
  return assetTagPrefixes[category]?.[subType] || null;
};

/**
 * Get the next sequence number for a given prefix
 * @param {object} models - Sequelize models
 * @param {string} prefix - Asset tag prefix
 * @returns {Promise<number>} The next sequence number (3-digit padded)
 */
const getNextSequenceNumber = async (models, prefix) => {
  try {
    // Find all assets with the same prefix pattern (PREFIX-XXX)
    const assets = await models.Asset.findAll({
      attributes: ['asset_tag'],
      where: {
        asset_tag: {
          [Op.like]: `${prefix}-%`
        }
      },
      order: [['asset_tag', 'DESC']],
      limit: 1,
      raw: true
    });

    if (assets.length === 0) {
      return 1;
    }

    // Extract the sequence number from the asset tag
    const lastTag = assets[0].asset_tag;
    const match = lastTag.match(/(\d+)$/); // Get trailing digits

    if (!match) {
      return 1;
    }

    const lastNumber = parseInt(match[1], 10);
    return lastNumber + 1;
  } catch (error) {
    console.error('Error getting next sequence number:', error);
    return 1;
  }
};

/**
 * Generate a unique asset tag
 * @param {object} models - Sequelize models
 * @param {string} category - Asset category ('IT' or 'Non-IT')
 * @param {string} subType - Asset subtype
 * @returns {Promise<string>} Generated asset tag (e.g., 'LAP-001')
 * @throws {Error} If prefix is not found or tag generation fails
 */
const generateAssetTag = async (models, category, subType) => {
  try {
    // Validate inputs
    if (!category || !subType) {
      throw new Error('Category and subtype are required');
    }

    // Get the prefix
    const prefix = getPrefix(category, subType);
    if (!prefix) {
      throw new Error(`Invalid category/subtype combination: ${category}/${subType}`);
    }

    // Get the next sequence number
    const nextNumber = await getNextSequenceNumber(models, prefix);

    // Ensure number doesn't exceed 999
    if (nextNumber > 999) {
      throw new Error(`Cannot generate asset tag: Sequence limit (999) exceeded for prefix ${prefix}`);
    }

    // Format the asset tag with 3-digit padding
    const paddedNumber = String(nextNumber).padStart(3, '0');
    const assetTag = `${prefix}-${paddedNumber}`;

    console.log(`✓ Generated asset tag: ${assetTag} (Prefix: ${prefix}, Sequence: ${nextNumber})`);

    return assetTag;
  } catch (error) {
    console.error('❌ Asset tag generation error:', error.message);
    throw error;
  }
};

/**
 * Validate if an asset tag follows the correct format
 * @param {string} assetTag - Asset tag to validate
 * @param {string} category - Asset category
 * @param {string} subType - Asset subtype
 * @returns {boolean} True if valid format
 */
const validateAssetTagFormat = (assetTag, category, subType) => {
  if (!assetTag || typeof assetTag !== 'string') {
    return false;
  }

  const prefix = getPrefix(category, subType);
  if (!prefix) {
    return false;
  }

  // Check if asset tag starts with correct prefix
  const expectedPattern = new RegExp(`^${prefix}-\\d{3}$`);
  return expectedPattern.test(assetTag);
};

/**
 * Get all valid subtypes for a category
 * @param {string} category - Asset category
 * @returns {string[]} Array of valid subtypes
 */
const getValidSubtypes = (category) => {
  return Object.keys(assetTagPrefixes[category] || {});
};

/**
 * Get all valid categories
 * @returns {string[]} Array of valid categories
 */
const getValidCategories = () => {
  return Object.keys(assetTagPrefixes);
};

module.exports = {
  getPrefix,
  getNextSequenceNumber,
  generateAssetTag,
  validateAssetTagFormat,
  getValidSubtypes,
  getValidCategories,
  assetTagPrefixes
};
