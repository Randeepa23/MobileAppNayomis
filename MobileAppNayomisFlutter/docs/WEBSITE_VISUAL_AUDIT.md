# Nayomi's Waterfront website visual audit

Audited on 2026-07-12 from the repository website source. Values below come from `src/index.css`, `tailwind.config.ts`, and the active React components; they are not sampled from screenshots.

## Verified colour system

| Semantic use | Website source | Resolved value |
| --- | --- | --- |
| Deep blue / primary structure | `--primary: 210 70% 35%` | `#1B5998` |
| Deep blue dark | `--deep-blue-dark: 210 70% 25%` | `#13406C` |
| Gold accent | `--gold: 45 100% 60%` | `#FFCC33` |
| Gold dark | `--gold-dark: 42 100% 50%` | `#FFB300` |
| Cream | `--cream: 40 40% 97%` | `#FAF8F2` |
| Page/card white | `--background`, `--card` | `#FFFFFF` |
| Main text | `--foreground: 220 20% 20%` | `#29303D` |
| Warm primary CTA | Tailwind `orange-600` | `#EA580C` |
| Warm red companion | Tailwind `red-600` | `#DC2626` |

The website's base design tokens are blue/gold, while active menu and promotional calls to action use an orange-to-red family. Flutter therefore uses orange for primary customer actions, deep blue for navigation and trust states, gold only for small accents, cream for the page canvas, and white for cards.

## Typography

- Tailwind declares `Playfair Display` for `font-serif` and `Inter` for `font-sans`.
- `src/index.css` assigns Inter to body copy and Playfair Display to headings.
- Logo utility rules reference Quicksand/Nunito plus fallbacks.
- No `.ttf`, `.otf`, `.woff`, or `.woff2` files are bundled outside dependencies, and there is no verified font-loading import in the app source. Flutter must not claim these fonts are packaged.
- Flutter uses platform sans-serif for interface/body copy and the platform serif fallback only for selected promotional display text.

## Shapes, spacing, and elevation

- Base radius: `0.75rem` (12 px). Website feature imagery commonly uses `rounded-2xl` (16 px) and filter pills use a full radius.
- Website responsive section padding typically moves from 40 px to 64 px and 80 px; cards commonly use 16–32 px internal padding.
- Verified shadows: card `0 2px 12px ... / 0.08`, elegant `0 10px 40px -10px ... / 0.2`, gold `0 4px 20px ... / 0.3`.
- Flutter translates these into an 8-point spacing system, 8/12/16/20/pill radii, subtle bordered cards, and restrained shadows.

## Component patterns

- White sticky website navigation with blue selected states; the mobile site replaces desktop navigation with a menu drawer below 768 px.
- Restaurant hero uses `3.png`, `4.png`, and `5.png`, cover fitting, a light dark overlay, 5-second rotation, and page indicators.
- Search controls are white, rounded, and use clear borders/focus states.
- Calls to action are either blue or orange/red; Flutter standardizes customer primary actions on orange and structural actions on blue.
- Services use white cards, circular gold icon surfaces, blue headings, and responsive grids.
- About uses a pale orange background, short text blocks, and a 16 px rounded image.
- Gallery uses pill filters, a responsive grid, lazy image loading, rounded thumbnails, and a full-screen viewer.
- Contact uses white cards, circular gold/blue icon treatments, and explicit opening-hours/status text.

## Mobile behaviour

- Website breakpoint hook treats widths below 768 px as mobile.
- Navigation changes from the desktop row to a drawer/menu on mobile.
- Section headings and spacing scale at `sm` and `md` breakpoints.
- Gallery changes from one to two, three, and four columns as width grows.
- Flutter uses native app bars and bottom navigation rather than reproducing the desktop header.

## Asset findings

- `3.png`, `4.png`, and `5.png` are the active restaurant hero set. They are wide 1920×800 banners with embedded promotional artwork/text and require mobile-aware cropping.
- `logo1.png` is the active navigation logo and is a 326×321 transparent PNG.
- `50.jpg` is the active About image (2048×1536 bakery display); `about-interior.jpg` and `30.jpg` are alternate interior images and are not active in About.
- `PRE-ORDER.png` is the verified school pre-order artwork.
- `10` through `24` are imported by the website Gallery. Several React accessibility descriptions/categories do not match the pixels. Flutter uses truthful descriptions/categories instead of copying those inaccurate labels.
- Named menu photographs are portrait 784×1168 files. They are not used as automatic Flutter fallbacks because the backend provides item identity/images and the site mapping is name-based, not stable-ID-based.
- `Delicious.png`, `short eats.png`, and `Enjoy Your Happy Meal.png` are dashboard banners, not the active public restaurant hero set.
- `Admin.png` is dashboard-only and inappropriate for the customer app.
- `logo.jpeg` and `logo-removebg-preview.png` are older logo variants; copying them would duplicate branding.
- `hero-vibrant.jpg` and `hero-waterfront.jpg` are attractive generic waterfront renders but are not referenced by the active website hero and were not selected.
- No website source asset was overwritten.
