# Rust + Dioxus + Tailwind - New Project

You are an expert Rust developer specializing in Dioxus web applications.

## ABSOLUTE DIRECTORY ISOLATION RULES
🚫 NEVER EVER modify, read, or reference ANY files outside: ${projectDir}
🚫 CREATE ALL NEW FILES - do not modify existing ones outside this directory
🚫 This is a COMPLETELY SEPARATE project - treat it as such

## REQUIRED STACK
✅ Rust as the programming language
✅ Dioxus for reactive web UI development
✅ Cargo as the build tool and dependency manager
✅ Modern Rust patterns with proper error handling
✅ Tailwind CSS for styling (embedded or external)

## MANDATORY SETUP

### Cargo.toml Configuration
```toml
[dependencies]
dioxus = { version = "0.5", features = ["web"] }
dioxus-web = "0.5"
dioxus-logger = "0.5"
log = "0.4"
console_error_panic_hook = "0.1"

# For web target
[target.'cfg(target_arch = "wasm32")'.dependencies]
wasm-bindgen = "0.2"
web-sys = "0.3"
```

### Dioxus.toml Configuration
```toml
[application]
name = "app_name"
default_platform = "web"

[web.app]
title = "App Title"

[web.watcher]
watch_path = ["src", "assets"]

# Note: web.resource is deprecated, use Stylesheet component in code instead
```

### src/main.rs Structure
```rust
#![allow(non_snake_case)]

use dioxus::prelude::*;
use dioxus_logger::tracing::{Level, info};

fn main() {
    dioxus_logger::init(Level::INFO).expect("failed to init logger");
    console_error_panic_hook::set_once();
    info!("Starting app");
    dioxus_web::launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        document::Link { rel: "stylesheet", href: asset!("assets/main.css") }
        div { "Hello, Dioxus!" }
    }
}
```

## CRITICAL DIOXUS PATTERNS

### Component Syntax
- Always import `dioxus::prelude::*` for hooks (use_state, use_effect, etc.)
- Use `#![allow(non_snake_case)]` at the top of main.rs for component naming
- Components use `#[component]` attribute and return `Element` type
- Use `rsx!` macro (not render!) for JSX-like syntax

### State Management
```rust
// Signal creation
let mut display = use_signal(|| String::from("0"));

// Reading signals
let display_value = display.read();

// Writing to signals
display.set(String::from("new_value"));

// Event handlers with signal updates
onclick: move |_| {
    display.set(format!("{}{}", display.read(), "7"));
}
```

### Closures with Signals
```rust
// Closures that capture signals correctly
let input_number = {
    let mut display = display.clone();
    move |num: &str| {
        if display.read().as_str() == "0" {
            display.set(num.to_string());
        } else {
            display.set(format!("{}{}", display.read(), num));
        }
    }
};

// Using closures in event handlers
onclick: {
    let input_number = input_number.clone();
    move |_| input_number("7")
}
```

### Props
```rust
#[component]
fn MyComponent(name: String) -> Element {
    rsx! { div { "Hello {name}" } }
}
```

## TAILWIND CSS SETUP

### MANDATORY Tailwind Configuration

#### package.json
```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "@tailwindcss/forms": "^0.5.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### tailwind.config.js
```javascript
module.exports = {
  content: ["./src/**/*.rs", "./index.html"],
  theme: { extend: {} },
  plugins: []
}
```

#### assets/input.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Build Command
```bash
npx tailwindcss -i assets/input.css -o assets/main.css --watch
```

## TAILWIND STYLING PATTERNS FOR DIOXUS

### MANDATORY CALCULATOR LAYOUT PATTERN
```rust
#[component]
fn Calculator() -> Element {
    let mut display = use_signal(|| String::from("0"));

    rsx! {
        document::Link { rel: "stylesheet", href: asset!("assets/main.css") }
        div {
            class: "min-h-screen bg-gray-100 flex items-center justify-center p-4",
            div {
                class: "bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm",
                h1 {
                    class: "text-2xl font-bold text-center mb-4 text-gray-800",
                    "Calculator"
                }

                // Display
                div {
                    class: "bg-gray-50 rounded-lg p-4 mb-6 text-right text-3xl font-mono border min-h-[60px] flex items-center justify-end",
                    "{display.read()}"
                }

                // CRITICAL: Button Grid - MUST USE CSS GRID WITH EXPLICIT STRUCTURE
                div {
                    class: "grid grid-cols-4 gap-3 w-full",
                    style: "display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;",

                    // Row 1: Clear and operators
                    button {
                        class: "bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors",
                        onclick: move |_| display.set("0".to_string()),
                        "C"
                    }
                    button {
                        class: "bg-gray-400 hover:bg-gray-500 text-white font-semibold py-4 px-4 rounded-lg transition-colors",
                        "±"
                    }
                    button {
                        class: "bg-gray-400 hover:bg-gray-500 text-white font-semibold py-4 px-4 rounded-lg transition-colors",
                        "%"
                    }
                    button {
                        class: "bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors",
                        "÷"
                    }

                    // More button rows...

                    // Row 5: 0 (spans 2 cols), ., =
                    button {
                        class: "bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-4 px-4 rounded-lg transition-colors col-span-2",
                        "0"
                    }
                    button {
                        class: "bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-4 px-4 rounded-lg transition-colors",
                        "."
                    }
                    button {
                        class: "bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors",
                        "="
                    }
                }
            }
        }
    }
}
```

### Common Tailwind Patterns
- Grid layouts: `class: "grid grid-cols-4 gap-2"` for calculators
- Responsive grids: `class: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4"`
- Cards: `class: "bg-white shadow-lg rounded-lg p-6 border border-gray-200"`
- Buttons: `class: "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"`
- Forms: `class: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"`

## CRITICAL STYLING REQUIREMENTS
- MANDATORY: Always include `document::Link` with `asset!("assets/main.css")` in root component
- MANDATORY: Use proper grid layout for calculators: `class: "grid grid-cols-4 gap-3"`
- MANDATORY: Add inline CSS fallback: `style: "display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;"`
- MANDATORY: Calculator apps MUST have exactly 4 columns with buttons flowing into rows
- MANDATORY: Buttons MUST have proper padding: `py-4 px-4` for adequate sizing (minimum 48px tall)
- MANDATORY: Use color-coded buttons: gray-200 for numbers, orange-500 for operators, red-500 for clear
- MANDATORY: Include hover effects: `hover:bg-gray-300`, `hover:bg-orange-600`, etc.

## Environment Variables Management

### Using dotenv crate
```toml
[dependencies]
dotenv = "0.15"
```

### Example .env
```
# API Configuration
API_BASE_URL=https://api.example.com
API_KEY=your_api_key_here
RUST_LOG=info

# External Services
OPENAI_API_KEY=sk-your_openai_key_here

# Application Settings
DEBUG_MODE=true
PORT=8080
```

### Usage in Rust Code
```rust
use dotenv::dotenv;
use std::env;

fn main() {
    dotenv().ok();

    let api_base_url = env::var("API_BASE_URL")
        .unwrap_or_else(|_| "https://api.defaultservice.com".to_string());

    let api_key = env::var("API_KEY")
        .expect("API_KEY environment variable is required");

    dioxus_web::launch(App);
}
```

## Documentation Requirements

### README.md
1. Project overview
2. **Rust environment setup** (Rust 1.70+, rustup, cargo)
3. **Dioxus CLI setup**: `cargo install dioxus-cli`
4. **Node.js setup for Tailwind**: npm dependencies
5. **Environment variables** (if applicable)
6. **How to run**:
   - Development: `dx serve --platform web`
   - Tailwind watch: `npx tailwindcss -i assets/input.css -o assets/main.css --watch`
7. **How to build**: `dx build --release`
8. WASM target: `rustup target add wasm32-unknown-unknown`

### DESIGN.md
1. Architecture and design decisions
2. **Rust + Dioxus structure**: Component hierarchy, state management with signals
3. Key features and implementation
4. **Tailwind CSS integration** and styling approach
5. Performance considerations and optimizations
6. WebAssembly deployment strategy
