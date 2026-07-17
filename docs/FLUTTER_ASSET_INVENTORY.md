# Flutter asset inventory

All selected files originate in `../src/assets/`. Optimized copies live only inside the Flutter project. WebP conversion used Pillow/Lanczos resizing, quality 78–84, with no generated or internet imagery.

## Branding and feature assets

| Original | Flutter destination | Use | Output dimensions / size | Optimization | Semantics |
| --- | --- | --- | --- | --- | --- |
| `src/assets/logo1.png` | `assets/branding/nayomis-logo.png` | Splash, auth, app branding | 326×321 / 111,624 B | None; transparency preserved | Meaningful: Nayomi's brand logo |
| `src/assets/3.png` | `assets/hero/hero-1.webp` | Home carousel, onboarding delivery | 1440×600 / 59,758 B | PNG→WebP q84 | Meaningful: delivery and pickup promotion |
| `src/assets/4.png` | `assets/hero/hero-2.webp` | Home carousel | 1440×600 / 96,218 B | PNG→WebP q84 | Meaningful: registration and fresh meal promotion |
| `src/assets/5.png` | `assets/hero/hero-3.webp` | Home carousel | 1440×600 / 49,024 B | PNG→WebP q84 | Meaningful: school breakfast care promotion |
| `src/assets/PRE-ORDER.png` | `assets/preorder/school-breakfast-preorder.webp` | Pre-order card/onboarding | 1200×500 / 40,784 B | PNG→WebP q84 | Meaningful: school food pre-order illustration |
| `src/assets/50.jpg` | `assets/about/nayomis-bakery-display.webp` | About and onboarding browse page | 1024×768 / 132,176 B | Downscaled, WebP q84 | Meaningful: Nayomi's bakery food display |

## Gallery assets

Each original has a mobile full-view WebP (maximum 1080×1080, quality 84) and a deliberately separate 480×480 cropped thumbnail (quality 78) so the grid does not decode full-size files. Full assets total approximately 1.62 MB; thumbnails total approximately 0.54 MB.

| Original | Full destination | Thumbnail destination | Flutter category | Accessibility description |
| --- | --- | --- | --- | --- |
| `src/assets/10.webp` | `assets/gallery/full/10.webp` | `assets/gallery/thumbs/10.webp` | Drinks | New Year celebration artwork with champagne glasses |
| `src/assets/11.webp` | `assets/gallery/full/11.webp` | `assets/gallery/thumbs/11.webp` | View | Halloween pumpkin display beside the waterfront at dusk |
| `src/assets/12.webp` | `assets/gallery/full/12.webp` | `assets/gallery/thumbs/12.webp` | Food | Sri Lankan rice and curry served on a banana leaf |
| `src/assets/13.webp` | `assets/gallery/full/13.webp` | `assets/gallery/thumbs/13.webp` | Food | Rice and curry presentation on an orange promotional background |
| `src/assets/14.jpg` | `assets/gallery/full/14.webp` | `assets/gallery/thumbs/14.webp` | Food | Chocolate-topped pastries |
| `src/assets/15.jpg` | `assets/gallery/full/15.webp` | `assets/gallery/thumbs/15.webp` | Food | Filled submarine sandwich |
| `src/assets/16.jpg` | `assets/gallery/full/16.webp` | `assets/gallery/thumbs/16.webp` | Food | Black pork rice meal presentation |
| `src/assets/17.jpg` | `assets/gallery/full/17.webp` | `assets/gallery/thumbs/17.webp` | Food | Authentic dum biryani menu artwork |
| `src/assets/18.jpg` | `assets/gallery/full/18.webp` | `assets/gallery/thumbs/18.webp` | Food | Rice meal with curries and accompaniments |
| `src/assets/19.webp` | `assets/gallery/full/19.webp` | `assets/gallery/thumbs/19.webp` | Food | Banana-leaf rice meal with curries |
| `src/assets/20.webp` | `assets/gallery/full/20.webp` | `assets/gallery/thumbs/20.webp` | Food | Sri Lankan meal delivery promotion |
| `src/assets/21.webp` | `assets/gallery/full/21.webp` | `assets/gallery/thumbs/21.webp` | Food | Fried rice with vegetables and cashews |
| `src/assets/22.webp` | `assets/gallery/full/22.webp` | `assets/gallery/thumbs/22.webp` | Food | Twelve-inch submarine sandwich promotion |
| `src/assets/23.webp` | `assets/gallery/full/23.webp` | `assets/gallery/thumbs/23.webp` | Food | Dosa meal promotion |
| `src/assets/24.jpg` | `assets/gallery/full/24.webp` | `assets/gallery/thumbs/24.webp` | Food | Filled bread roll with lettuce |

The Interior filter is intentionally retained as a requested category but currently shows an honest empty state because the website Gallery component does not import an interior photograph. The About image is not duplicated into Gallery.

## Rejected assets

- `Admin.png`: admin dashboard artwork, unrelated to customer journeys.
- `Delicious.png`, `short eats.png`, `Enjoy Your Happy Meal.png`: dashboard/promotional alternates; not the verified public hero set and some contain dense embedded text.
- `logo.jpeg`, `logo-removebg-preview.png`, `herologo.png`: duplicate/older logo treatments; `logo1.png` is active in website navigation.
- `hero-vibrant.jpg`, `hero-waterfront.jpg`: unreferenced alternative/generic waterfront renders.
- `about-interior.jpg`, `30.jpg`: unused alternate interiors; selected About source is the active `50.jpg`.
- `1.webp`, `2.webp`: not imported by the active Gallery and do not cover a requested customer flow better than selected assets.
- Named menu images (`Fish Roll.webp`, `fish bun.jpg`, `fish pastry.jpg`, `chicken burger.jpg`, `chicken pastry.jpg`, `sausage pastry.jpg`, `seenisambol bun.jpg`, `tea bun.jpg`): rejected as automatic local fallbacks because the website maps them by mutable display names. Flutter continues to show backend image URLs and a neutral branded error state rather than risk showing the wrong food.
