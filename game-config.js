// PT's Maze Adventure - Game Configuration
// This file centralizes all level-specific configuration to eliminate hardcoded conditionals

const LEVEL_CONFIG = {
    1: {
        difficulty: 'beginner',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 10,
                operations: ['addition', 'subtraction'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'word_emoji_matching',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: false
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    2: {
        difficulty: 'beginner',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 15,
                operations: ['addition', 'subtraction'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'word_emoji_matching',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: false
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    3: {
        difficulty: 'intermediate',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 20,
                operations: ['addition', 'subtraction'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'word_emoji_matching',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: false
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    4: {
        difficulty: 'intermediate',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 25,
                operations: ['addition', 'subtraction'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'word_emoji_matching',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: false
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    5: {
        difficulty: 'intermediate',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 30,
                operations: ['addition', 'subtraction'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'word_emoji_matching',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: false
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    6: {
        difficulty: 'advanced',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'number_line',
                maxNumber: 50,
                operations: ['addition', 'subtraction'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'digraph_sounds',
                tracking: {
                    preventRepetition: true,
                    usedDigraphs: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            },
            reading2: {
                type: 'emoji_to_word',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'reading2', 'heart', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: true
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    7: {
        difficulty: 'advanced',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'division_visual',
                maxNumber: 100,
                operations: ['division'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'digraph_sounds',
                tracking: {
                    preventRepetition: true,
                    usedDigraphs: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            },
            reading2: {
                type: 'emoji_to_word',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'reading2', 'heart', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: true
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    8: {
        difficulty: 'advanced',
        features: ['basic_movement'],
        puzzles: {
            math: {
                type: 'multiplication_groups',
                maxNumber: 100,
                operations: ['multiplication'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'digraph_sounds',
                tracking: {
                    preventRepetition: true,
                    usedDigraphs: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            },
            reading2: {
                type: 'emoji_to_word',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'reading2', 'heart', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: false,
            hearts: true
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 3
    },
    
    9: {
        difficulty: 'expert',
        features: ['basic_movement', 'rocket_boost'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 100,
                operations: ['addition', 'subtraction', 'multiplication'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'digraph_sounds',
                tracking: {
                    preventRepetition: true,
                    usedDigraphs: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            },
            reading2: {
                type: 'emoji_to_word',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'reading2', 'bonus', 'heart', 'endpoint'],
            sprites: {
                celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 },
                bonus: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: true,
            hearts: true
        },
        animation: {
            celebrationFrames: 20,
            frameDelay: 25
        },
        startingHearts: 5,
        rocketBoost: {
            speedMultiplier: 2,
            backgroundEffect: true,
            heartBonus: 2
        }
    },
    
    10: {
        difficulty: 'expert',
        features: ['basic_movement', 'rocket_boost'],
        puzzles: {
            math: {
                type: 'simple_arithmetic',
                maxNumber: 100,
                operations: ['addition', 'subtraction', 'multiplication'],
                tracking: {
                    preventRepetition: true,
                    maxAttempts: 3,
                    trackingScope: 'level'
                }
            },
            reading: {
                type: 'digraph_sounds',
                tracking: {
                    preventRepetition: true,
                    usedDigraphs: [],
                    trackingScope: 'level'
                }
            },
            reading1: {
                type: 'letter_matching',
                tracking: {
                    preventRepetition: true,
                    usedLetters: [],
                    trackingScope: 'level'
                }
            },
            reading2: {
                type: 'emoji_to_word',
                tracking: {
                    preventRepetition: true,
                    usedWords: [],
                    trackingScope: 'level'
                }
            }
        },
        assets: {
            textures: ['wall', 'open', 'math', 'reading', 'reading1', 'reading2', 'bonus', 'heart', 'endpoint'],
            sprites: {
                celebrate: { frames: 53, frameWidth: 200, frameHeight: 200 },
                movement: { frames: 6, frameWidth: 160, frameHeight: 160 },
                bonus: { frames: 6, frameWidth: 160, frameHeight: 160 }
            },
            bonus: true,
            hearts: true
        },
        animation: {
            celebrationFrames: 53,
            frameDelay: 25
        },
        startingHearts: 5,
        rocketBoost: {
            speedMultiplier: 2,
            backgroundEffect: true,
            heartBonus: 2
        }
    }
};

// Character configuration for future character selection
const CHARACTER_CONFIG = {
    PT: {
        name: 'PT the Elephant',
        movement: 'PT-sprite.svg',
        bonus: 'PT-Bonus-Sprite.svg',
        description: 'A friendly elephant who loves solving puzzles'
    }
    // Future characters can be added here
};

// Export for use in other modules (when we modularize further)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LEVEL_CONFIG, CHARACTER_CONFIG };
}