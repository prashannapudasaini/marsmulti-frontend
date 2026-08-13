export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core Multimars Theme Palette
        primary: "#f8f2f2",      // main-bg: warm luxury cream background
        secondary: "#ffffff",    // card and drawer background
        surface: "#f5f5f7",      // soft-gray: interactive & container background
        "accent-electric": "#7b1113", // brand-primary: luxury burgundy wine
        "accent-cyan": "#f29c38",     // brand-secondary: warm gold/amber
        "accent-gold": "#f29c38",
        "text-muted": "#64748b",      // slate-500 secondary specs text
        
        // Explicit Multimars variable aliases
        "brand-primary": "#7b1113",
        "brand-secondary": "#f29c38",
        "brand-dark": "#4a0a0c",
        "main-bg": "#f8f2f2",
        "rich-charcoal": "#1d1d1f",
        "soft-gray": "#f5f5f7",
        "subtle-gray": "#e5e5ea",

        bg: {
          primary: "#f8f2f2",    
          secondary: "#ffffff",  
          surface: "#f5f5f7",    
        },
        accent: {
          electric: "#7b1113",   
          cyan: "#f29c38",       
          gold: "#f29c38",       
        },
        text: {
          muted: "#64748b",      
        }
      },
      fontFamily: {
        heading: ["Inter", "Manrope", "sans-serif"],
        body: ["Inter", "Manrope", "sans-serif"],
      }
    }
  },
  plugins: [],
}
