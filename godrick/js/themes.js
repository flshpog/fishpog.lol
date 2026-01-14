// Theme definitions
const themes = {
    dark: {
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#242424',
        '--bg-tertiary': '#2d2d2d',
        '--text-primary': '#efefef',
        '--text-secondary': '#b4b4b4',
        '--border': '#3d3d3d',
        '--accent': '#cc785c',
        '--accent-hover': '#d88968'
    },
    light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f5f5f5',
        '--bg-tertiary': '#e8e8e8',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#666666',
        '--border': '#d0d0d0',
        '--accent': '#cc785c',
        '--accent-hover': '#b5684d'
    },
    ocean: {
        '--bg-primary': '#0d1b2a',
        '--bg-secondary': '#1b263b',
        '--bg-tertiary': '#274060',
        '--text-primary': '#e0e1dd',
        '--text-secondary': '#98a8b8',
        '--border': '#3d5a73',
        '--accent': '#4ea8de',
        '--accent-hover': '#6bc1f0'
    },
    forest: {
        '--bg-primary': '#1a1f16',
        '--bg-secondary': '#242b1e',
        '--bg-tertiary': '#2f3a28',
        '--text-primary': '#e8efe0',
        '--text-secondary': '#a8b89a',
        '--border': '#3d4a34',
        '--accent': '#6b9b4f',
        '--accent-hover': '#7eb35e'
    },
    sunset: {
        '--bg-primary': '#1f1520',
        '--bg-secondary': '#2a1f2d',
        '--bg-tertiary': '#3a2a3d',
        '--text-primary': '#f5e6e8',
        '--text-secondary': '#c4a8ae',
        '--border': '#4d3a4f',
        '--accent': '#e07850',
        '--accent-hover': '#f08860'
    },
    midnight: {
        '--bg-primary': '#0f0f1a',
        '--bg-secondary': '#16162a',
        '--bg-tertiary': '#1f1f3a',
        '--text-primary': '#e8e8f0',
        '--text-secondary': '#9898b8',
        '--border': '#2d2d4a',
        '--accent': '#8b5cf6',
        '--accent-hover': '#a78bfa'
    }
};

// Font definitions
const fonts = {
    default: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'Courier New', Consolas, Monaco, monospace",
    serif: "Georgia, 'Times New Roman', Times, serif",
    rounded: "'Comic Sans MS', 'Comic Neue', cursive, sans-serif"
};

// Theme manager class
class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.currentFont = 'default';
        this.customAccent = null;
        this.onPreferencesChange = null;

        this.loadPreferences();
    }

    loadPreferences() {
        // Try to load from localStorage first (works for guests too)
        const stored = localStorage.getItem('wright_preferences');
        if (stored) {
            try {
                const prefs = JSON.parse(stored);
                this.applyPreferences(prefs);
            } catch (e) {
                console.error('Error loading preferences:', e);
            }
        }
    }

    applyPreferences(prefs) {
        if (prefs.theme) {
            this.currentTheme = prefs.theme;
            this.applyTheme(prefs.theme);
        }
        if (prefs.font) {
            this.currentFont = prefs.font;
            this.applyFont(prefs.font);
        }
        if (prefs.customAccent) {
            this.customAccent = prefs.customAccent;
            this.applyAccentColor(prefs.customAccent);
        }
    }

    applyTheme(themeName) {
        const theme = themes[themeName];
        if (!theme) return;

        this.currentTheme = themeName;
        const root = document.documentElement;

        // Apply all theme colors
        for (const [property, value] of Object.entries(theme)) {
            root.style.setProperty(property, value);
        }

        // If there's a custom accent, reapply it
        if (this.customAccent) {
            this.applyAccentColor(this.customAccent);
        }

        // Update active state in UI
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        this.savePreferences();
    }

    applyFont(fontName) {
        const font = fonts[fontName];
        if (!font) return;

        this.currentFont = fontName;
        document.documentElement.style.setProperty('--font-family', font);
        document.body.style.fontFamily = font;

        // Update active state in UI
        document.querySelectorAll('.font-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === fontName);
        });

        this.savePreferences();
    }

    applyAccentColor(color) {
        this.customAccent = color;
        document.documentElement.style.setProperty('--accent', color);

        // Calculate hover color (slightly lighter)
        const hoverColor = this.lightenColor(color, 15);
        document.documentElement.style.setProperty('--accent-hover', hoverColor);

        // Update color picker UI
        const picker = document.getElementById('accentColorPicker');
        const value = document.getElementById('accentColorValue');
        if (picker) picker.value = color;
        if (value) value.textContent = color;

        this.savePreferences();
    }

    resetAccentColor() {
        this.customAccent = null;
        const theme = themes[this.currentTheme];
        document.documentElement.style.setProperty('--accent', theme['--accent']);
        document.documentElement.style.setProperty('--accent-hover', theme['--accent-hover']);

        // Update color picker UI
        const picker = document.getElementById('accentColorPicker');
        const value = document.getElementById('accentColorValue');
        if (picker) picker.value = theme['--accent'];
        if (value) value.textContent = theme['--accent'];

        this.savePreferences();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    savePreferences() {
        const prefs = {
            theme: this.currentTheme,
            font: this.currentFont,
            customAccent: this.customAccent
        };

        // Always save to localStorage (works for guests)
        localStorage.setItem('wright_preferences', JSON.stringify(prefs));

        // If logged in, also save to server
        if (this.onPreferencesChange) {
            this.onPreferencesChange(prefs);
        }
    }

    getPreferences() {
        return {
            theme: this.currentTheme,
            font: this.currentFont,
            customAccent: this.customAccent
        };
    }
}

// Global theme manager instance
const themeManager = new ThemeManager();
