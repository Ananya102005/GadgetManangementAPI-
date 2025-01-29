// Define word lists for name generation
const prefixes = ["The"];

const descriptiveWords = [
    // Animals
    "Falcon", "Phoenix", "Dragon", "Kraken", "Serpent", "Panther", "Wolf", "Eagle", "Cobra", "Raven",
    "Scorpion", "Mantis", "Leopard", "Jaguar", "Viper", "Hawk", "Owl", "Lion", "Tiger", "Lynx",
    "Caracal", "Falcon", "Mongoose", "Piranha", "Octopus", "Basilisk", "Chimera", "Manticore",
    
    // Nature & Elements
    "Storm", "Thunder", "Shadow", "Lightning", "Frost", "Flame", "Inferno", "Cyclone", "Avalanche",
    "Tsunami", "Volcano", "Hurricane", "Tempest", "Blizzard", "Tornado", "Earthquake", "Glacier",
    "Mountain", "Ocean", "Desert", "Forest", "River", "Canyon", "Cascade", "Meteor", "Comet",
    
    // Objects & Weapons
    "Blade", "Shield", "Scepter", "Crown", "Hammer", "Sentinel", "Beacon", "Oracle", "Prism",
    "Dagger", "Sword", "Katana", "Scimitar", "Rapier", "Crossbow", "Arrow", "Spear", "Lance",
    "Gauntlet", "Armor", "Helm", "Cloak", "Ring", "Amulet", "Talisman", "Crystal", "Mirror",
    
    // Abstract Concepts
    "Phantom", "Ghost", "Specter", "Enigma", "Wraith", "Mirage", "Paradox", "Echo", "Cipher",
    "Shadow", "Illusion", "Vision", "Dream", "Nightmare", "Destiny", "Fate", "Fortune", "Glory",
    "Honor", "Victory", "Legend", "Myth", "Mystery", "Secret", "Riddle", "Eternity", "Infinity",
    
    // Technical & Scientific
    "Matrix", "Vector", "Nexus", "Quantum", "Cipher", "Protocol", "Algorithm", "Binary", "Cortex",
    "Pixel", "Data", "Code", "Network", "Signal", "Frequency", "Wavelength", "Resonance", "Pulse",
    "Circuit", "Node", "Core", "Interface", "System", "Module", "Array", "Sequence", "Function",
    
    // Mythology & Legend
    "Atlas", "Titan", "Oracle", "Chimera", "Hydra", "Medusa", "Griffin", "Phoenix", "Sphinx",
    "Zeus", "Thor", "Odin", "Loki", "Ares", "Apollo", "Artemis", "Athena", "Hermes", "Hades",
    "Valkyrie", "Dragon", "Pegasus", "Unicorn", "Leviathan", "Kraken", "Banshee", "Siren",
    
    // Space & Cosmic
    "Nova", "Pulsar", "Nebula", "Quasar", "Stellar", "Cosmos", "Zenith", "Aurora", "Helios",
    "Galaxy", "Star", "Comet", "Asteroid", "Planet", "Moon", "Orbit", "Eclipse", "Solar",
    "Lunar", "Cosmic", "Celestial", "Astral", "Supernova", "Constellation", "Meteor", "Void",
    
    // Time & Dimension
    "Chronos", "Temporal", "Vortex", "Portal", "Gateway", "Dimension", "Parallel", "Crossing",
    "Timekeeper", "Warp", "Flux", "Stream", "Current", "Flow", "Passage", "Bridge", "Door",
    
    // Advanced Technology
    "Quantum", "Nano", "Cyber", "Tech", "Mech", "Synth", "Bio", "Cryo", "Pyro", "Electro",
    "Sonic", "Plasma", "Laser", "Fusion", "Fission", "Ion", "Particle", "Wave", "Field",
    "Shield", "Barrier", "Generator", "Reactor", "Engine", "Drive", "Processor", "Core",
    
    // Stealth & Espionage
    "Whisper", "Silence", "Shadow", "Ghost", "Phantom", "Wraith", "Specter", "Shade",
    "Cipher", "Code", "Signal", "Beacon", "Scout", "Spy", "Agent", "Operative", "Infiltrator",
    "Ranger", "Hunter", "Tracker", "Seeker", "Finder", "Watcher", "Guardian", "Sentinel",
    
    // Elemental Forces
    "Inferno", "Glacial", "Storm", "Thunder", "Lightning", "Tempest", "Vortex", "Cyclone",
    "Tsunami", "Quake", "Tremor", "Shock", "Wave", "Pulse", "Surge", "Blast", "Strike",
    
    // Materials & Substances
    "Diamond", "Platinum", "Titanium", "Carbon", "Steel", "Iron", "Gold", "Silver", "Crystal",
    "Obsidian", "Adamant", "Mithril", "Quantum", "Plasma", "Mercury", "Chrome", "Neon"
];

const generateGadgetName = async (prismaClient: any): Promise<string> => {
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
        // Generate a random name
        const descriptiveWord = descriptiveWords[Math.floor(Math.random() * descriptiveWords.length)];
        const gadgetName = `${prefixes[0]} ${descriptiveWord}`;
        
        try {
            // Check if name already exists in database
            const existingGadget = await prismaClient.gadget.findFirst({
                where: { name: gadgetName }
            });
            
            if (!existingGadget) {
                return gadgetName;
            }
        } catch (error) {
            console.error("Error checking gadget name:", error);
            throw new Error("Failed to generate unique gadget name");
        }
        
        attempts++;
    }
    
    throw new Error("Could not generate a unique gadget name after maximum attempts");
};

export { generateGadgetName };