# React Native + NativeWind — Shared Rules

These rules apply to ALL React Native + NativeWind projects (new and existing).

**🚨 MANDATORY: Use the Read tool to read `.claude/skills/react-native-setup/reference/rn-component-rules.md` AND `.claude/skills/react-native-setup/reference/rn-visual-design.md` BEFORE creating any component files. These contain component mapping rules and visual design patterns that MUST be applied to all generated code. 🚨**

---

## CRITICAL: Flex Layout MUST Use `style` Prop

**`className="flex-1"`, `className="flex-row"`, etc. silently fail on iOS/Android.** Layout collapses to zero height (blank screen). This is the #1 cause of "works on web, blank on native."

```typescript
// WRONG — blank on iOS/Android
<View className="flex-1">
<View className="flex-row">
<SafeAreaView className="flex-1">

// CORRECT — works everywhere
<View style={{ flex: 1 }}>
<View style={{ flexDirection: 'row' }}>
<SafeAreaView style={{ flex: 1 }}>
```

**Rule:** Use `style` for flex/flexDirection/overflow. Use `className` for colors, padding, margins, borders, text, rounding, gap, alignment.

---

## CRITICAL: No HTML Elements

React Native uses its own components. HTML elements crash on native.

- `<div>` -> `<View>`, `<span>`/`<p>` -> `<Text>`, `<button>` -> `<TouchableOpacity>`, `<input>` -> `<TextInput>`, `<img>` -> `<Image>`
- All text must be inside `<Text>` components
- **Read `.claude/skills/react-native-setup/reference/rn-component-rules.md` for full mapping table before creating component files**

---

## CRITICAL: No CSS Grid on Native

CSS Grid classes (`grid`, `grid-cols-*`, `col-span-*`) are web-only — completely ignored on iOS/Android.

**Always use flexbox:**
```typescript
// ❌ WRONG — grid (web only)
<View className="grid grid-cols-4 gap-3">

// ✅ CORRECT — flexbox (all platforms)
<View style={{ flexDirection: 'row' }} className="gap-3">
  <View style={{ flex: 1 }}><Button text="1" /></View>
  <View style={{ flex: 1 }}><Button text="2" /></View>
  <View style={{ flex: 1 }}><Button text="3" /></View>
  <View style={{ flex: 1 }}><Button text="4" /></View>
</View>
```

**Spanning columns:** Use `style={{ flex: 2 }}` instead of `col-span-2`.

**Multi-row layout:** Use separate `flexDirection: 'row'` Views for each row:
```typescript
<View className="gap-3">
  <View style={{ flexDirection: 'row' }} className="gap-3">
    <View style={{ flex: 1 }}><Button text="7" /></View>
    <View style={{ flex: 1 }}><Button text="8" /></View>
    <View style={{ flex: 1 }}><Button text="9" /></View>
  </View>
  <View style={{ flexDirection: 'row' }} className="gap-3">
    <View style={{ flex: 1 }}><Button text="4" /></View>
    <View style={{ flex: 1 }}><Button text="5" /></View>
    <View style={{ flex: 1 }}><Button text="6" /></View>
  </View>
</View>
```

---

## CRITICAL: No Tailwind Gradient Classes on Native

**🚨 `bg-gradient-to-*`, `from-*`, `to-*`, `via-*` classes are WEB-ONLY — completely ignored on iOS/Android 🚨**

Tailwind's gradient utilities compile to CSS `background-image: linear-gradient(...)`, which React Native's `View` does not support. On native, these classes are silently ignored, resulting in a white/transparent background.

```typescript
// ❌ WRONG - Gradient classes are ignored on native, background is white
<View className="flex-1 bg-gradient-to-br from-blue-500 to-purple-600">
  <Text className="text-white">Invisible on native!</Text>
</View>

// ✅ CORRECT - Works on all platforms
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#3b82f6', '#9333ea']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{ flex: 1 }}
>
  <Text className="text-white">Visible everywhere!</Text>
</LinearGradient>
```

**🚨 CRITICAL: `LinearGradient` does NOT support NativeWind `className` on native 🚨**

`LinearGradient` is NOT registered with NativeWind's `cssInterop`. Using `className` on it will silently fail on iOS/Android — the gradient collapses to zero height.

```typescript
// ❌ WRONG - className is ignored on native, gradient collapses to 0 height
<LinearGradient colors={['#667eea', '#764ba2']} className="flex-1">

// ✅ CORRECT - use style prop for LinearGradient layout
<LinearGradient colors={['#667eea', '#764ba2']} style={{ flex: 1 }}>
```

**General rule:** Only use `className` on React Native core components (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `TextInput`, `Image`, `Pressable`, `Switch`, `FlatList`, `ImageBackground`, `SafeAreaView`). For third-party components like `LinearGradient`, `BlurView`, `MapView`, etc., always use the `style` prop.

**🚨 CRITICAL: NEVER wrap LinearGradient with `Animated.createAnimatedComponent()` 🚨**

`Animated.createAnimatedComponent(LinearGradient)` causes the gradient to render at **opacity 0 on web** — the screen appears white/washed-out while iOS looks fine. This applies to BOTH Reanimated and RN Animated versions.

```typescript
// ❌ WRONG — gradient is INVISIBLE on web (opacity stuck at 0)
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
<AnimatedGradient colors={colors} style={[{ flex: 1 }, animatedStyle]} />

// ✅ CORRECT — wrap in Animated.View instead (works with both RN Animated and Reanimated)
<Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
  <LinearGradient colors={colors} style={{ flex: 1 }} />
</Animated.View>

// ✅ BEST — no animation wrapper needed, just render directly
<LinearGradient colors={colors} style={{ flex: 1 }} />
```

If you need to animate a gradient's opacity, wrap the `LinearGradient` inside an `Animated.View` — never make the gradient itself animated. Always set `backgroundColor: colors[0]` on the parent `View` to prevent white flash.

---

## CRITICAL: Full-Screen Backgrounds Must Be Absolutely Positioned

Background components (gradients, animated weather, particles) MUST be absolutely positioned behind content — **NEVER as flex siblings**.

```typescript
// ❌ WRONG — Background and content split the screen 50/50
<View style={{ flex: 1 }}>
  <GradientBackground />              {/* Takes half the screen */}
  <SafeAreaView style={{ flex: 1 }}>  {/* Takes other half */}
    <ScrollView>...</ScrollView>
  </SafeAreaView>
</View>

// ✅ CORRECT — Background behind content via absolute positioning
<View style={{ flex: 1 }}>
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
    <GradientBackground />
  </View>
  <SafeAreaView style={{ flex: 1 }}>
    <ScrollView>...</ScrollView>
  </SafeAreaView>
</View>
```

**Read `.claude/skills/react-native-setup/reference/rn-visual-design.md` for detailed background patterns.**

---

## CRITICAL: NativeWind Static Classes Only

Dynamic class name construction fails silently. NativeWind compiles classes at build time.

```typescript
// WRONG
<View className={`bg-${color}-500`}>

// CORRECT
<View className={isActive ? 'bg-blue-500' : 'bg-gray-500'}>
```

**Read `.claude/skills/react-native-setup/reference/rn-nativewind-rules.md` for detailed patterns.**

---

## Visual Design Quality

Generated apps must look professional, not like basic prototypes. The web preview is the first thing users see — it must look as good as the native app.

**🚨 CRITICAL: Default to dark theme or dark gradient backgrounds 🚨**

Light themes and light gradients produce washed-out web previews where text becomes invisible and cards blend into the background. **Always use dark backgrounds unless the user explicitly requests a light theme.**

- **Dark theme/gradient: PREFERRED DEFAULT** — dark backgrounds (`bg-gray-900`, `bg-slate-900`) or dark gradients with white text
- **Light theme: ONLY if user explicitly requests it** — requires `bg-white` cards with `border border-gray-200`, never glassmorphism (`bg-white/10`)

**Required for every app:**
- Cohesive color scheme — not random colors per component
- Font weight hierarchy: bold titles, semibold labels, normal body
- Rounded corners on cards and buttons (`rounded-xl` or `rounded-2xl`)
- Adequate padding: `p-4` minimum on screens, `p-4`/`p-5` on cards
- Large touch targets: 44pt minimum height on buttons (`py-3` minimum)
- Status bar: `<StatusBar style="light" />` (dark theme) or `style="dark"` (light theme)
- Active/pressed states on interactive elements

**Web preview parity — use dark, saturated gradients:**
- Use dark, saturated gradients (e.g., `['#1a1a2e', '#16213e']`, `['#0f2027', '#203a43', '#2c5364']`, `['#2c3e50', '#34495e']`) — avoid light/pastel gradients with white text
- EVERY color in the gradient must be dark — light colors like `#7f9fc5`, `#95a5a6`, `#bdc3c7` appear nearly white on web
- If white text is used, the darkest gradient color must be darker than `#555555`
- **NEVER use `bg-white/10` or `bg-white/15` glassmorphism cards on light backgrounds** — invisible on web

**Web spacing — `SafeAreaView` insets are zero on web (no status bar, no home indicator):**
- On web, content starts at pixel 0 — looks scrunched compared to iOS
- ScrollView screens: use `contentContainerStyle={{ paddingTop: Platform.OS === 'web' ? 40 : 20 }}`
- Non-scrollable screens: add `paddingTop: Platform.OS === 'web' ? 20 : 0` inside SafeAreaView

**Read `.claude/skills/react-native-setup/reference/rn-visual-design.md` for full design guide.**

---

## SDK Version Routing

### Default: SDK 54
If user doesn't specify an SDK version, use SDK 54.

**SDK version files:**
- SDK 54: Read `.claude/skills/react-native-setup/reference/rn-sdk54-versions.md`
- SDK 55: Read `.claude/skills/react-native-setup/reference/rn-sdk55-versions.md`

**Package.json template** (SDK 54):
`.claude/skills/react-native-setup/templates/configs/package.json`

Copy it, update `"name"`, run `npx expo install --fix`.

### SDK 55+ (Upgrade from existing app)
If user requests an SDK upgrade, **read `.claude/skills/react-native-setup/reference/rn-sdk-upgrade-guide.md` and follow the complete workflow.** The critical steps are:

1. `npm install expo@~{version}.0.0`
2. `npx expo install --fix`
3. `npx expo doctor` (verify 16/17 checks pass)
4. Update app.json: add `"userInterfaceStyle": "automatic"`
5. Remove `babel-preset-expo` from package.json if present (bundled with expo)
6. Remove `'react-native-worklets/plugin'` from babel.config.js plugins array (babel-preset-expo auto-adds it in SDK 55)
7. **CRITICAL: Replace ALL `react-native-reanimated` imports** with React Native's built-in `Animated` API. Reanimated does NOT work in SDK 55 — crashes iOS with `global._getAnimationTimestamp is not a function`. See upgrade guide Step 4b for conversion table.
8. **CRITICAL: Clear Metro cache.** Use the `restart_project` MCP tool to restart the dev server — do NOT manually run `npm start`. **Skipping this causes a blank white screen.**
9. Wait for "Bundled X modules" message before declaring success
10. Verify app loads and functions correctly

**NEVER declare an upgrade successful until the app is verified working after Metro restart.**

### SDK 55 (New project)
If user requests a new SDK 55 project:
1. Inform: "SDK 55 is experimental. I'll set up using SDK 55 dependency versions."
2. Read `.claude/skills/react-native-setup/reference/rn-sdk55-versions.md` for exact versions
3. Use SDK 54 config templates but update dependency versions per the SDK 55 matrix
4. **Do NOT import from `react-native-reanimated` in any app component** — use React Native's built-in `Animated` API (`import { Animated } from 'react-native'`) for all animations. See SDK 55 versions file for conversion table.
5. Run `npx expo install --fix` to verify
6. Add `"_sdkNote"` to package.json

---

## SQLite Detection

**🚨 CRITICAL: Check if user needs local database 🚨**

**Trigger SQLite skill if user mentions:**
- "local database", "offline storage", "SQLite", "store data locally", "local persistence"
- "CRUD operations", "create/update/delete records", "manage collections"
- "todo app", "messaging app", "contacts app", "notes app" with data storage
- "todos", "messages", "contacts", "posts", "items", "records" (storing collections)
- "offline-first", "local-first", "cache data", "sync later"

**Examples that MUST trigger SQLite skill:**
- ✅ "Create a todo app with local persistence"
- ✅ "Build messaging app with offline storage"
- ✅ "Add local database to store contacts"
- ✅ "Create app that creates/updates/deletes msgs and stores them in local database"

**When NOT to use SQLite (use AsyncStorage instead):**
- ❌ "Save user preferences" → Simple key-value storage
- ❌ "Store auth token" → Single value
- ❌ "Remember dark mode" → Single setting

**If SQLite is needed, invoke skill IMMEDIATELY:**
```
Use Skill tool: expo-sqlite-integration
```

---

## CRITICAL: External API and Mock Data Requirements

**🚨 Apps that require external APIs MUST be functional and demonstrable out of the box 🚨**

When the app depends on an external API requiring an API key, the generated app **MUST work immediately** without the user needing to configure anything first.

### Rules:

1. **Generate realistic mock/sample data** as the default data source
   - Create a mock data module (e.g., `services/mockData.ts`) with realistic sample data
   - Mock data MUST match the exact shape of the real API response (same field names, types, and structure)
   - Include enough variety to make the app look real (e.g., multiple cities with different weather)
   - **Mock data must be static constants** — never reference other mock data objects during initialization (causes circular reference crashes)

2. **The service layer MUST auto-detect and fall back to mock data** when no valid API key is configured
   - Check if the API key is a placeholder (`'your_api_key_here'`, empty, or undefined)
   - If no valid key, return mock data immediately — do NOT make the API call
   - If a valid key exists, use the real API

3. **Display a subtle indicator when running with mock data**
   - Show a small banner or badge (e.g., "📋 Sample data — configure API key for live data")
   - The banner should be unobtrusive — not block content or look like an error

4. **Never show an error screen or broken state as the first thing the user sees**
   - The app must load successfully with mock data on first run

5. **Keep the real API integration fully implemented alongside mock data**
   - Switching from mock to real data should only require setting the API key in `.env`

### Service Layer Pattern:

```typescript
// services/mockData.ts
export const MOCK_WEATHER: WeatherData = {
  name: 'San Francisco',
  main: { temp: 18, feels_like: 16, humidity: 72, temp_min: 14, temp_max: 21 },
  weather: [{ id: 802, main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
  wind: { speed: 5.2 },
  // ... complete mock data matching real API shape
};

// services/weatherService.ts
function isApiKeyConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your_api_key_here';
}

export class WeatherService {
  static async getCurrentWeather(city: string): Promise<WeatherData> {
    if (!isApiKeyConfigured()) {
      return getMockWeatherForCity(city);
    }
    // Real API call
    const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    return response.json();
  }

  static isUsingMockData(): boolean {
    return !isApiKeyConfigured();
  }
}
```

**ENFORCEMENT:** If the app uses an external API with an API key, you MUST implement the mock data fallback pattern. The app must display real-looking content on first load, not an error screen.

**Read `.claude/skills/react-native-setup/reference/rn-mock-data-pattern.md` for additional patterns.**

---

## CRITICAL: Expo Package Web Compatibility

**🚨 Some Expo packages render differently on web vs native — always provide fallbacks 🚨**

### expo-blur (BlurView)

`BlurView` from `expo-blur` does **NOT** render a transparent blur on web. On web, it falls back to an opaque or semi-opaque solid background.

```typescript
// ❌ WRONG - White text invisible on web because BlurView renders as solid white
<BlurView intensity={40} tint="light">
  <View className="p-5">
    <Text className="text-white text-lg">This text is invisible on web</Text>
  </View>
</BlurView>

// ✅ CORRECT - Dark background ensures text is readable on ALL platforms
<View className="rounded-3xl overflow-hidden border border-white/20">
  {Platform.OS !== 'web' ? (
    <BlurView intensity={40} tint="dark" className="overflow-hidden">
      <View className="bg-white/10 p-5">
        <Text className="text-white text-lg">Readable everywhere</Text>
      </View>
    </BlurView>
  ) : (
    <View className="bg-black/40 p-5">
      <Text className="text-white text-lg">Readable everywhere</Text>
    </View>
  )}
</View>
```

**Alternative: Skip BlurView entirely and use opacity-based glassmorphism:**
```typescript
// ✅ CORRECT - Works identically on web and native, no expo-blur needed
<View className="rounded-3xl overflow-hidden border border-white/20 bg-white/10 p-5"
  style={{
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 5,
  }}
>
  <Text className="text-white text-lg">Readable everywhere</Text>
</View>
```

**Key rules for BlurView:**
- ❌ **NEVER** use `tint="light"` with white text — invisible on web
- ✅ **ALWAYS** use `tint="dark"` if text is white
- ✅ **PREFER** opacity-based glassmorphism (`bg-white/10`, `bg-black/30`) over BlurView for consistency

### expo-linear-gradient — No Animated Wrapping

**NEVER use `Animated.createAnimatedComponent(LinearGradient)`** — see the "CRITICAL: NEVER wrap LinearGradient with Animated.createAnimatedComponent()" section above for the full rule and correct patterns.

---

## CRITICAL: Device APIs Must Be Wrapped in try/catch with Timeout

**🚨 `expo-location`, `expo-camera`, `expo-sensors` crash on web and can hang on simulators 🚨**

Device-specific APIs throw uncaught exceptions on web (blank white screen) and can hang indefinitely on iOS simulators (stuck on "Loading..." forever). Always wrap in try/catch **with a timeout** and a fallback.

```typescript
// ❌ WRONG — crashes on web, hangs on iOS simulator
const { status } = await Location.requestForegroundPermissionsAsync();
const location = await Location.getCurrentPositionAsync({});

// ✅ CORRECT — try/catch with timeout and fallback
const loadWithLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      // Timeout prevents hanging on simulator/emulator
      const location = await Promise.race([
        Location.getCurrentPositionAsync({}),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Location timeout')), 5000)),
      ]);
      // use location...
      return;
    }
  } catch (error) {
    console.warn('Location not available:', error);
  }
  // Fallback: load default data
  await loadWeather('San Francisco');
};
```

**Rules:**
- **ALWAYS** wrap device API calls in try/catch
- **ALWAYS** add a timeout (5 seconds) using `Promise.race` on calls that can hang (e.g., `getCurrentPositionAsync`)
- **ALWAYS** provide a fallback in the catch block (default city, mock data, skip feature)
- **NEVER** let a device API failure crash the app or hang indefinitely — degrade gracefully
- **NEVER** block the initial app load on location — load default data first, then update with location if available

---

## CRITICAL: Reanimated Does NOT Work in SDK 55

**`react-native-reanimated` does NOT work in SDK 55.** Its native TurboModule fails to initialize, crashing iOS/Android with `global._getAnimationTimestamp is not a function`.

**For SDK 55 apps:** Use React Native's built-in `Animated` API (`import { Animated } from 'react-native'`) instead of `react-native-reanimated` for all animations. Keep `react-native-reanimated` and `react-native-worklets` in package.json — NativeWind needs them at build time — but never import from `react-native-reanimated` in app components.

**For SDK 54 apps:** Reanimated works fine. Use `react-native-reanimated` as normal.

**Read `.claude/skills/react-native-setup/reference/rn-sdk55-versions.md` for the complete Reanimated → RN Animated conversion table.**

---

## Reanimated Easing Names (SDK 54 only)

Easing functions use abbreviated math names. Wrong names crash the app. **Only relevant for SDK 54 — SDK 55 apps should not import from `react-native-reanimated`.**

| Correct | Wrong |
|---------|-------|
| `Easing.sin` | `Easing.sine` |
| `Easing.quad` | `Easing.quadratic` |
| `Easing.exp` | `Easing.exponential` |
| `Easing.circle` | `Easing.circular` |

---

## Ngrok Tunnel Configuration

Ngrok tunnel support is managed entirely by the system at runtime. Do NOT add `@expo/ngrok` to package.json, create patch scripts, or modify tunnel configuration. If ngrok errors occur, report them — don't try to fix tunnel config.

---

## CRITICAL: SafeAreaProvider Is Always Required

**Every app must wrap its root with `SafeAreaProvider`** — even single-screen apps without navigation. Without it, `SafeAreaView` may not render content on web.

```typescript
// ❌ WRONG — no SafeAreaProvider, breaks on web
export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Content</Text>
    </SafeAreaView>
  );
}

// ✅ CORRECT — SafeAreaProvider wraps everything
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Text>Content</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
```

---

## ScrollView & Modal Layout

**Read `.claude/skills/react-native-setup/reference/rn-scrollview-layout.md` before creating scrollable screens or modals.**

Quick rules:
- Fixed layouts (calculator, login): Use `SafeAreaView` + `View` with `style={{ flex: 1 }}` — no ScrollView
- Scrollable content: `<ScrollView style={{ flex: 1, overflow: 'scroll' }}>` — never `contentContainerClassName="flex-1"`
- Inside Modal: Do NOT use `flex: 1` on ScrollView — let it size based on content
- Horizontal filter tabs/chips: Use `View` with `flexDirection: 'row'` for 4 or fewer tabs. If horizontal ScrollView is needed, wrap in a `View` with fixed `height` (e.g., `height: 52`) — otherwise buttons expand vertically on web

## CRITICAL: Fixed-Layout Screens Must Fit the Viewport

**Calculators, keypads, and grid-button screens MUST use `flex` for button heights — NEVER `aspectRatio: 1`**

`aspectRatio: 1` makes buttons square, but with many rows + gaps + display area, the total height exceeds the screen and the bottom rows get clipped off-screen.

```typescript
// ❌ WRONG — aspectRatio: 1 causes bottom rows to overflow off-screen
<TouchableOpacity style={{ flex: 1, aspectRatio: 1 }}>
  <Text>7</Text>
</TouchableOpacity>

// ✅ CORRECT — flex distributes rows evenly within available space
<View style={{ flex: 1 }} className="gap-3">        {/* Display area */}
  <Text className="text-6xl text-right">{display}</Text>
</View>
<View style={{ flex: 3 }} className="gap-3">         {/* Button grid — takes 3x the display */}
  <View style={{ flex: 1, flexDirection: 'row' }} className="gap-3">
    <TouchableOpacity style={{ flex: 1 }} className="rounded-2xl items-center justify-center bg-gray-600">
      <Text className="text-white text-2xl">C</Text>
    </TouchableOpacity>
    {/* ... more buttons */}
  </View>
  {/* ... more rows, each with style={{ flex: 1 }} */}
</View>
```

**Rules for fixed-layout screens:**
- Use `flex` ratios between display area and button grid (e.g., display `flex: 1`, grid `flex: 3`)
- Each button row gets `style={{ flex: 1 }}` to share space equally
- Each button gets `style={{ flex: 1 }}` to share row width equally
- **NEVER** use `aspectRatio` on buttons in multi-row grids — it overflows the screen
- The entire layout must fit within `SafeAreaView` without scrolling

---

## React Hooks Rules

Hooks (useState, useEffect, useContext, custom hooks) MUST be called at the top level of function components only. Never inside callbacks, loops, conditions, or event handlers.

---

## Documentation

Use the `documenting-projects` skill for ALL documentation. Never create .md files manually.
- Main README -> project root
- All other docs -> `/docs/` directory

---

## File Writing Rules

Write ONE file per tool call. Wait for response before writing next file.
