// Validation utilities for form inputs and file uploads

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const MIN_TEXT_LENGTH = 1;
const MAX_TEXT_LENGTH = 120;

// Simple prohibited words list (can be expanded)
const PROHIBITED_WORDS = [
  "copyright",
  "trademark",
  "disney",
  "pokemon",
  "mario",
  "nintendo",
  "sony",
  "microsoft",
  "apple",
  "coca-cola",
  "mcdonald",
  "starbucks",
  // Add more as needed
];

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateImageFile(file: File): ValidationResult {
  const errors: ValidationError[] = [];

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push({
      field: "faceImage",
      message: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    });
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      field: "faceImage",
      message: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateHouseTheme(text: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Check length
  if (text.length < MIN_TEXT_LENGTH) {
    errors.push({
      field: "houseTheme",
      message: `Text too short. Minimum length: ${MIN_TEXT_LENGTH} characters`,
    });
  }

  if (text.length > MAX_TEXT_LENGTH) {
    errors.push({
      field: "houseTheme",
      message: `Text too long. Maximum length: ${MAX_TEXT_LENGTH} characters`,
    });
  }

  // Check for prohibited words
  const lowerText = text.toLowerCase();
  const foundProhibited = PROHIBITED_WORDS.find(word => 
    lowerText.includes(word.toLowerCase())
  );

  if (foundProhibited) {
    errors.push({
      field: "houseTheme",
      message: "Text contains prohibited content. Please avoid brand names or copyrighted material.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateVibe(vibe: string): ValidationResult {
  const validVibes = ["元気", "上品", "クール"];
  const errors: ValidationError[] = [];

  if (!validVibes.includes(vibe)) {
    errors.push({
      field: "vibe",
      message: `Invalid vibe. Allowed values: ${validVibes.join(", ")}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePose(pose: string): ValidationResult {
  const validPoses = ["手を振る", "ピース", "腰に手"];
  const errors: ValidationError[] = [];

  if (!validPoses.includes(pose)) {
    errors.push({
      field: "pose",
      message: `Invalid pose. Allowed values: ${validPoses.join(", ")}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}