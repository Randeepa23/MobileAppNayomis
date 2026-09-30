# Flutter asset inventory

All selected files originate in `../src/assets/`. Optimized copies live only inside the Flutter project. WebP conversion used Pillow/Lanczos resizing, quality 78–84, with no generated or internet imagery.

## Branding and feature assets

| Original | Flutter destination | Use | Output dimensions / size | Optimization | Semantics |
| --- | --- | --- | --- | --- | --- |
| `src/assets/logo1.png` | `assets/branding/nayomis-logo.png` | Auth and app branding | 326×321 / 111,624 B | None; transparency preserved | Meaningful: Nayomi's brand logo |
| `src/assets/PRE-ORDER.png` | `assets/preorder/school-breakfast-preorder.webp` | Pre-order card | 1200×500 / 40,784 B | PNG→WebP q84 | Meaningful: school food pre-order illustration |
| `src/assets/50.jpg` | `assets/about/nayomis-bakery-display.webp` | About page | 1024×768 / 132,176 B | Downscaled, WebP q84 | Meaningful: Nayomi's bakery food display |

## Menu assets

Seven portrait JPEGs from the website menu catalog are explicitly mapped by normalized item name. They provide the local menu when the backend returns no food records and supply clear images for matching backend records while preserving backend IDs, prices, and availability.

| Flutter destination | Menu item | Dimensions |
| --- | --- | --- |
| `assets/menu/chicken burger.jpg` | Chicken Burger | 784×1168 |
| `assets/menu/chicken pastry.jpg` | Chicken Pastry | 784×1168 |
| `assets/menu/fish bun.jpg` | Fish Bun | 784×1168 |
| `assets/menu/fish pastry.jpg` | Fish Pastry | 784×1168 |
| `assets/menu/sausage pastry.jpg` | Sausage Pastry | 784×1168 |
| `assets/menu/seenisambol bun.jpg` | Seeni Sambol Bun | 784×1168 |
| `assets/menu/tea bun.jpg` | Tea Bun | 784×1168 |

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
