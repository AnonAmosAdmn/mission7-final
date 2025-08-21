// Game configuration
export const GAME_CONFIG = {
  // Your registered game address
  GAME_ADDRESS: '0xEEfa0c1605562B4Aa419821204836Aa1826775D4',
  
  // Game settings
  SCORE_SUBMISSION: {
    // Submit score every X points
    SCORE_THRESHOLD: 10,
    
    // Track transactions (actions that cost points/tokens)
    TRANSACTION_THRESHOLD: 1,
  },
  
  // Game metadata
  METADATA: {
    name: 'Dark Dungeon',
    url: 'https://dark-dungeon-mission7.vercel.app/',
    image: '/logo.png'
  }
} as const;