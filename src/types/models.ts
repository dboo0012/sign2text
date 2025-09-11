// Model constants for the application
export const MODELS = {
  OPENAI: 'gpt-4o-mini',
  SLR: 'GloFE'
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];

// Display names for the models
export const MODEL_DISPLAY_NAMES = {
  [MODELS.OPENAI]: 'OpenAI GPT-4o Mini',
  [MODELS.SLR]: 'GloFE'
} as const;
