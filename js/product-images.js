/* گالری تصاویر محصولات؛ هر محصول می‌تواند تا ۵۰ تصویر داشته باشد. */
(function(){
"use strict";
const FALLBACK="images/products/placeholder-product.svg";
/*MAP-START*/
const MAP = {
  "airpods-4": [
    "images/products/airpods-4-1.svg",
    "images/products/airpods-4-2.svg",
    "images/products/airpods-4-3.svg",
    "images/products/airpods-4-4.svg"
  ],
  "airpods-pro-2": [
    "images/products/airpods-pro-2-1.svg",
    "images/products/airpods-pro-2-2.svg",
    "images/products/airpods-pro-2-3.svg",
    "images/products/airpods-pro-2-4.svg"
  ],
  "amazfit-gtr-4": [
    "images/products/amazfit-gtr-4-1.svg",
    "images/products/amazfit-gtr-4-2.svg",
    "images/products/amazfit-gtr-4-3.svg",
    "images/products/amazfit-gtr-4-4.svg"
  ],
  "amazfit-gts-4-mini": [
    "images/products/amazfit-gts-4-mini-1.svg",
    "images/products/amazfit-gts-4-mini-2.svg",
    "images/products/amazfit-gts-4-mini-3.svg",
    "images/products/amazfit-gts-4-mini-4.svg"
  ],
  "amazfit-t-rex-2": [
    "images/products/amazfit-t-rex-2-1.svg",
    "images/products/amazfit-t-rex-2-2.svg",
    "images/products/amazfit-t-rex-2-3.svg",
    "images/products/amazfit-t-rex-2-4.svg"
  ],
  "anker-10000": [
    "images/products/anker-10000-1.svg",
    "images/products/anker-10000-2.svg",
    "images/products/anker-10000-3.svg",
    "images/products/anker-10000-4.svg"
  ],
  "anker-100w-gan": [
    "images/products/anker-100w-gan-1.svg",
    "images/products/anker-100w-gan-2.svg",
    "images/products/anker-100w-gan-3.svg",
    "images/products/anker-100w-gan-4.svg"
  ],
  "anker-20000": [
    "images/products/anker-20000-1.svg",
    "images/products/anker-20000-2.svg",
    "images/products/anker-20000-3.svg",
    "images/products/anker-20000-4.svg"
  ],
  "anker-30w": [
    "images/products/anker-30w-1.svg",
    "images/products/anker-30w-2.svg",
    "images/products/anker-30w-3.svg",
    "images/products/anker-30w-4.svg"
  ],
  "anker-65w-gan": [
    "images/products/anker-65w-gan-1.svg",
    "images/products/anker-65w-gan-2.svg",
    "images/products/anker-65w-gan-3.svg",
    "images/products/anker-65w-gan-4.svg"
  ],
  "anker-737": [
    "images/products/anker-737-1.svg",
    "images/products/anker-737-2.svg",
    "images/products/anker-737-3.svg",
    "images/products/anker-737-4.svg"
  ],
  "anker-q30": [
    "images/products/anker-q30-1.svg",
    "images/products/anker-q30-2.svg",
    "images/products/anker-q30-3.svg",
    "images/products/anker-q30-4.svg"
  ],
  "apple-20w": [
    "images/products/apple-20w-1.svg",
    "images/products/apple-20w-2.svg",
    "images/products/apple-20w-3.svg",
    "images/products/apple-20w-4.svg"
  ],
  "apple-35w-dual": [
    "images/products/apple-35w-dual-1.svg",
    "images/products/apple-35w-dual-2.svg",
    "images/products/apple-35w-dual-3.svg",
    "images/products/apple-35w-dual-4.svg"
  ],
  "apple-airpods-pro-2-case": [
    "images/products/apple-airpods-pro-2-case-1.svg",
    "images/products/apple-airpods-pro-2-case-2.svg",
    "images/products/apple-airpods-pro-2-case-3.svg",
    "images/products/apple-airpods-pro-2-case-4.svg"
  ],
  "apple-ipad-pro-case": [
    "images/products/apple-ipad-pro-case-1.svg",
    "images/products/apple-ipad-pro-case-2.svg",
    "images/products/apple-ipad-pro-case-3.svg",
    "images/products/apple-ipad-pro-case-4.svg"
  ],
  "apple-leather-16": [
    "images/products/apple-leather-16-1.svg",
    "images/products/apple-leather-16-2.svg",
    "images/products/apple-leather-16-3.svg",
    "images/products/apple-leather-16-4.svg"
  ],
  "apple-lightning-cable": [
    "images/products/apple-lightning-cable-1.svg",
    "images/products/apple-lightning-cable-2.svg",
    "images/products/apple-lightning-cable-3.svg",
    "images/products/apple-lightning-cable-4.svg"
  ],
  "apple-magsafe-battery": [
    "images/products/apple-magsafe-battery-1.svg",
    "images/products/apple-magsafe-battery-2.svg",
    "images/products/apple-magsafe-battery-3.svg",
    "images/products/apple-magsafe-battery-4.svg"
  ],
  "apple-magsafe-clear-16pm": [
    "images/products/apple-magsafe-clear-16pm-1.svg",
    "images/products/apple-magsafe-clear-16pm-2.svg",
    "images/products/apple-magsafe-clear-16pm-3.svg",
    "images/products/apple-magsafe-clear-16pm-4.svg"
  ],
  "apple-silicone-16-pro": [
    "images/products/apple-silicone-16-pro-1.svg",
    "images/products/apple-silicone-16-pro-2.svg",
    "images/products/apple-silicone-16-pro-3.svg",
    "images/products/apple-silicone-16-pro-4.svg"
  ],
  "apple-watch-leather-band": [
    "images/products/apple-watch-leather-band-1.svg",
    "images/products/apple-watch-leather-band-2.svg",
    "images/products/apple-watch-leather-band-3.svg",
    "images/products/apple-watch-leather-band-4.svg"
  ],
  "apple-watch-se": [
    "images/products/apple-watch-se-1.svg",
    "images/products/apple-watch-se-2.svg",
    "images/products/apple-watch-se-3.svg",
    "images/products/apple-watch-se-4.svg"
  ],
  "apple-watch-series-10": [
    "images/products/apple-watch-series-10-1.svg",
    "images/products/apple-watch-series-10-2.svg",
    "images/products/apple-watch-series-10-3.svg",
    "images/products/apple-watch-series-10-4.svg"
  ],
  "apple-watch-silicone-band": [
    "images/products/apple-watch-silicone-band-1.svg",
    "images/products/apple-watch-silicone-band-2.svg",
    "images/products/apple-watch-silicone-band-3.svg",
    "images/products/apple-watch-silicone-band-4.svg"
  ],
  "apple-watch-ultra-2": [
    "images/products/apple-watch-ultra-2-1.svg",
    "images/products/apple-watch-ultra-2-2.svg",
    "images/products/apple-watch-ultra-2-3.svg",
    "images/products/apple-watch-ultra-2-4.svg"
  ],
  "asus-tuf-f16": [
    "images/products/asus-tuf-f16-1.svg",
    "images/products/asus-tuf-f16-2.svg",
    "images/products/asus-tuf-f16-3.svg",
    "images/products/asus-tuf-f16-4.svg"
  ],
  "asus-vivobook-16x": [
    "images/products/asus-vivobook-16x-1.svg",
    "images/products/asus-vivobook-16x-2.svg",
    "images/products/asus-vivobook-16x-3.svg",
    "images/products/asus-vivobook-16x-4.svg"
  ],
  "asus-zenbook-14": [
    "images/products/asus-zenbook-14-1.svg",
    "images/products/asus-zenbook-14-2.svg",
    "images/products/asus-zenbook-14-3.svg",
    "images/products/asus-zenbook-14-4.svg"
  ],
  "baseus-10000": [
    "images/products/baseus-10000-1.svg",
    "images/products/baseus-10000-2.svg",
    "images/products/baseus-10000-3.svg",
    "images/products/baseus-10000-4.svg"
  ],
  "baseus-100w-gan": [
    "images/products/baseus-100w-gan-1.svg",
    "images/products/baseus-100w-gan-2.svg",
    "images/products/baseus-100w-gan-3.svg",
    "images/products/baseus-100w-gan-4.svg"
  ],
  "baseus-20000-65w": [
    "images/products/baseus-20000-65w-1.svg",
    "images/products/baseus-20000-65w-2.svg",
    "images/products/baseus-20000-65w-3.svg",
    "images/products/baseus-20000-65w-4.svg"
  ],
  "baseus-65w-gan": [
    "images/products/baseus-65w-gan-1.svg",
    "images/products/baseus-65w-gan-2.svg",
    "images/products/baseus-65w-gan-3.svg",
    "images/products/baseus-65w-gan-4.svg"
  ],
  "baseus-bowie-ma10": [
    "images/products/baseus-bowie-ma10-1.svg",
    "images/products/baseus-bowie-ma10-2.svg",
    "images/products/baseus-bowie-ma10-3.svg",
    "images/products/baseus-bowie-ma10-4.svg"
  ],
  "baseus-cable-2m": [
    "images/products/baseus-cable-2m-1.svg",
    "images/products/baseus-cable-2m-2.svg",
    "images/products/baseus-cable-2m-3.svg",
    "images/products/baseus-cable-2m-4.svg"
  ],
  "baseus-hdmi-21": [
    "images/products/baseus-hdmi-21-1.svg",
    "images/products/baseus-hdmi-21-2.svg",
    "images/products/baseus-hdmi-21-3.svg",
    "images/products/baseus-hdmi-21-4.svg"
  ],
  "baseus-wireless-15w": [
    "images/products/baseus-wireless-15w-1.svg",
    "images/products/baseus-wireless-15w-2.svg",
    "images/products/baseus-wireless-15w-3.svg",
    "images/products/baseus-wireless-15w-4.svg"
  ],
  "garmin-fenix-7x": [
    "images/products/garmin-fenix-7x-1.svg",
    "images/products/garmin-fenix-7x-2.svg",
    "images/products/garmin-fenix-7x-3.svg",
    "images/products/garmin-fenix-7x-4.svg"
  ],
  "garmin-venu-2": [
    "images/products/garmin-venu-2-1.svg",
    "images/products/garmin-venu-2-2.svg",
    "images/products/garmin-venu-2-3.svg",
    "images/products/garmin-venu-2-4.svg"
  ],
  "garmin-venu-3": [
    "images/products/garmin-venu-3-1.svg",
    "images/products/garmin-venu-3-2.svg",
    "images/products/garmin-venu-3-3.svg",
    "images/products/garmin-venu-3-4.svg"
  ],
  "hiska-20000": [
    "images/products/hiska-20000-1.svg",
    "images/products/hiska-20000-2.svg",
    "images/products/hiska-20000-3.svg",
    "images/products/hiska-20000-4.svg"
  ],
  "hiska-30000": [
    "images/products/hiska-30000-1.svg",
    "images/products/hiska-30000-2.svg",
    "images/products/hiska-30000-3.svg",
    "images/products/hiska-30000-4.svg"
  ],
  "hp-envy-15": [
    "images/products/hp-envy-15-1.svg",
    "images/products/hp-envy-15-2.svg",
    "images/products/hp-envy-15-3.svg",
    "images/products/hp-envy-15-4.svg"
  ],
  "hp-pavilion-15": [
    "images/products/hp-pavilion-15-1.svg",
    "images/products/hp-pavilion-15-2.svg",
    "images/products/hp-pavilion-15-3.svg",
    "images/products/hp-pavilion-15-4.svg"
  ],
  "hp-spectre-x360": [
    "images/products/hp-spectre-x360-1.svg",
    "images/products/hp-spectre-x360-2.svg",
    "images/products/hp-spectre-x360-3.svg",
    "images/products/hp-spectre-x360-4.svg"
  ],
  "hp-victus-16": [
    "images/products/hp-victus-16-1.svg",
    "images/products/hp-victus-16-2.svg",
    "images/products/hp-victus-16-3.svg",
    "images/products/hp-victus-16-4.svg"
  ],
  "huawei-mate-x5": [
    "images/products/huawei-mate-x5-1.svg",
    "images/products/huawei-mate-x5-2.svg",
    "images/products/huawei-mate-x5-3.svg",
    "images/products/huawei-mate-x5-4.svg"
  ],
  "huawei-matepad-11": [
    "images/products/huawei-matepad-11-1.svg",
    "images/products/huawei-matepad-11-2.svg",
    "images/products/huawei-matepad-11-3.svg",
    "images/products/huawei-matepad-11-4.svg"
  ],
  "huawei-matepad-11-5": [
    "images/products/huawei-matepad-11-5-1.svg",
    "images/products/huawei-matepad-11-5-2.svg",
    "images/products/huawei-matepad-11-5-3.svg",
    "images/products/huawei-matepad-11-5-4.svg"
  ],
  "huawei-matepad-pro-13-2": [
    "images/products/huawei-matepad-pro-13-2-1.svg",
    "images/products/huawei-matepad-pro-13-2-2.svg",
    "images/products/huawei-matepad-pro-13-2-3.svg",
    "images/products/huawei-matepad-pro-13-2-4.svg"
  ],
  "huawei-nova-12": [
    "images/products/huawei-nova-12-1.svg",
    "images/products/huawei-nova-12-2.svg",
    "images/products/huawei-nova-12-3.svg",
    "images/products/huawei-nova-12-4.svg"
  ],
  "huawei-nova-12i": [
    "images/products/huawei-nova-12i-1.svg",
    "images/products/huawei-nova-12i-2.svg",
    "images/products/huawei-nova-12i-3.svg",
    "images/products/huawei-nova-12i-4.svg"
  ],
  "huawei-pura-70-pro": [
    "images/products/huawei-pura-70-pro-1.svg",
    "images/products/huawei-pura-70-pro-2.svg",
    "images/products/huawei-pura-70-pro-3.svg",
    "images/products/huawei-pura-70-pro-4.svg"
  ],
  "huawei-pura-70-ultra": [
    "images/products/huawei-pura-70-ultra-1.svg",
    "images/products/huawei-pura-70-ultra-2.svg",
    "images/products/huawei-pura-70-ultra-3.svg",
    "images/products/huawei-pura-70-ultra-4.svg"
  ],
  "ipad-10-9": [
    "images/products/ipad-10-9-1.svg",
    "images/products/ipad-10-9-2.svg",
    "images/products/ipad-10-9-3.svg",
    "images/products/ipad-10-9-4.svg"
  ],
  "ipad-air-11-m2": [
    "images/products/ipad-air-11-m2-1.svg",
    "images/products/ipad-air-11-m2-2.svg",
    "images/products/ipad-air-11-m2-3.svg",
    "images/products/ipad-air-11-m2-4.svg"
  ],
  "ipad-pro-11-m4": [
    "images/products/ipad-pro-11-m4-1.svg",
    "images/products/ipad-pro-11-m4-2.svg",
    "images/products/ipad-pro-11-m4-3.svg",
    "images/products/ipad-pro-11-m4-4.svg"
  ],
  "ipad-pro-12-9-m4": [
    "images/products/ipad-pro-12-9-m4-1.svg",
    "images/products/ipad-pro-12-9-m4-2.svg",
    "images/products/ipad-pro-12-9-m4-3.svg",
    "images/products/ipad-pro-12-9-m4-4.svg"
  ],
  "iphone-15": [
    "images/products/iphone-15-1.webp",
    "images/products/iphone-15-2.webp",
    "images/products/iphone-15-3.webp",
    "images/products/iphone-15-4.webp"
  ],
  "iphone-15-pro": [
    "images/products/iphone-15-pro-1.jpg",
    "images/products/iphone-15-pro-2.jpg",
    "images/products/iphone-15-pro-3.jpg",
    "images/products/iphone-15-pro-4.svg"
  ],
  "iphone-16": [
    "images/products/iphone-16-1.jpg",
    "images/products/iphone-16-2.jpg",
    "images/products/iphone-16-3.jpg",
    "images/products/iphone-16-4.jpg"
  ],
  "iphone-16-pro": [
    "images/products/iphone-16-pro-1.jpg",
    "images/products/iphone-16-pro-2.jpg",
    "images/products/iphone-16-pro-3.jpg",
    "images/products/iphone-16-pro-4.jpg"
  ],
  "iphone-16-pro-max": [
    "images/products/iphone-16-pro-max-1.webp",
    "images/products/iphone-16-pro-max-2.webp",
    "images/products/iphone-16-pro-max-3.webp",
    "images/products/iphone-16-pro-max-4.webp"
  ],
  "jbl-tune-770nc": [
    "images/products/jbl-tune-770nc-1.svg",
    "images/products/jbl-tune-770nc-2.svg",
    "images/products/jbl-tune-770nc-3.svg",
    "images/products/jbl-tune-770nc-4.svg"
  ],
  "lenovo-ideapad-3": [
    "images/products/lenovo-ideapad-3-1.svg",
    "images/products/lenovo-ideapad-3-2.svg",
    "images/products/lenovo-ideapad-3-3.svg",
    "images/products/lenovo-ideapad-3-4.svg"
  ],
  "lenovo-legion-pro-5": [
    "images/products/lenovo-legion-pro-5-1.svg",
    "images/products/lenovo-legion-pro-5-2.svg",
    "images/products/lenovo-legion-pro-5-3.svg",
    "images/products/lenovo-legion-pro-5-4.svg"
  ],
  "lenovo-x1-carbon": [
    "images/products/lenovo-x1-carbon-1.svg",
    "images/products/lenovo-x1-carbon-2.svg",
    "images/products/lenovo-x1-carbon-3.svg",
    "images/products/lenovo-x1-carbon-4.svg"
  ],
  "macbook-air-15-m3": [
    "images/products/macbook-air-15-m3-1.svg",
    "images/products/macbook-air-15-m3-2.svg",
    "images/products/macbook-air-15-m3-3.svg",
    "images/products/macbook-air-15-m3-4.svg"
  ],
  "macbook-pro-14-m3-pro": [
    "images/products/macbook-pro-14-m3-pro-1.svg",
    "images/products/macbook-pro-14-m3-pro-2.svg",
    "images/products/macbook-pro-14-m3-pro-3.svg",
    "images/products/macbook-pro-14-m3-pro-4.svg"
  ],
  "macbook-pro-16-m3-max": [
    "images/products/macbook-pro-16-m3-max-1.svg",
    "images/products/macbook-pro-16-m3-max-2.svg",
    "images/products/macbook-pro-16-m3-max-3.svg",
    "images/products/macbook-pro-16-m3-max-4.svg"
  ],
  "marshall-major-v": [
    "images/products/marshall-major-v-1.svg",
    "images/products/marshall-major-v-2.svg",
    "images/products/marshall-major-v-3.svg",
    "images/products/marshall-major-v-4.svg"
  ],
  "marshall-minor-iv": [
    "images/products/marshall-minor-iv-1.svg",
    "images/products/marshall-minor-iv-2.svg",
    "images/products/marshall-minor-iv-3.svg",
    "images/products/marshall-minor-iv-4.svg"
  ],
  "poco-x6-pro": [
    "images/products/poco-x6-pro-1.jpg",
    "images/products/poco-x6-pro-2.jpg",
    "images/products/poco-x6-pro-3.jpg",
    "images/products/poco-x6-pro-4.jpg"
  ],
  "redmi-15": [
    "images/products/redmi-15-1.svg",
    "images/products/redmi-15-2.svg",
    "images/products/redmi-15-3.svg",
    "images/products/redmi-15-4.svg"
  ],
  "redmi-note-13-pro": [
    "images/products/redmi-note-13-pro-1.png",
    "images/products/redmi-note-13-pro-2.jpg",
    "images/products/redmi-note-13-pro-3.jpg",
    "images/products/redmi-note-13-pro-4.jpg"
  ],
  "rog-strix-scar-18": [
    "images/products/rog-strix-scar-18-1.svg",
    "images/products/rog-strix-scar-18-2.svg",
    "images/products/rog-strix-scar-18-3.svg",
    "images/products/rog-strix-scar-18-4.svg"
  ],
  "rog-zephyrus-g14": [
    "images/products/rog-zephyrus-g14-1.svg",
    "images/products/rog-zephyrus-g14-2.svg",
    "images/products/rog-zephyrus-g14-3.svg",
    "images/products/rog-zephyrus-g14-4.svg"
  ],
  "samsung-45w": [
    "images/products/samsung-45w-1.svg",
    "images/products/samsung-45w-2.svg",
    "images/products/samsung-45w-3.svg",
    "images/products/samsung-45w-4.svg"
  ],
  "samsung-a16": [
    "images/products/samsung-a16-1.webp",
    "images/products/samsung-a16-2.webp",
    "images/products/samsung-a16-3.webp",
    "images/products/samsung-a16-4.webp"
  ],
  "samsung-a25": [
    "images/products/samsung-a25-1.jpg",
    "images/products/samsung-a25-2.jpg",
    "images/products/samsung-a25-3.jpg",
    "images/products/samsung-a25-4.svg"
  ],
  "samsung-a55": [
    "images/products/samsung-a55-1.webp",
    "images/products/samsung-a55-2.webp",
    "images/products/samsung-a55-3.webp",
    "images/products/samsung-a55-4.webp"
  ],
  "samsung-buds2-pro": [
    "images/products/samsung-buds2-pro-1.svg",
    "images/products/samsung-buds2-pro-2.svg",
    "images/products/samsung-buds2-pro-3.svg",
    "images/products/samsung-buds2-pro-4.svg"
  ],
  "samsung-buds3": [
    "images/products/samsung-buds3-1.svg",
    "images/products/samsung-buds3-2.svg",
    "images/products/samsung-buds3-3.svg",
    "images/products/samsung-buds3-4.svg"
  ],
  "samsung-buds3-pro": [
    "images/products/samsung-buds3-pro-1.svg",
    "images/products/samsung-buds3-pro-2.svg",
    "images/products/samsung-buds3-pro-3.svg",
    "images/products/samsung-buds3-pro-4.svg"
  ],
  "samsung-case-a55": [
    "images/products/samsung-case-a55-1.svg",
    "images/products/samsung-case-a55-2.svg",
    "images/products/samsung-case-a55-3.svg",
    "images/products/samsung-case-a55-4.svg"
  ],
  "samsung-case-s25": [
    "images/products/samsung-case-s25-1.svg",
    "images/products/samsung-case-s25-2.svg",
    "images/products/samsung-case-s25-3.svg",
    "images/products/samsung-case-s25-4.svg"
  ],
  "samsung-case-s25-ultra": [
    "images/products/samsung-case-s25-ultra-1.svg",
    "images/products/samsung-case-s25-ultra-2.svg",
    "images/products/samsung-case-s25-ultra-3.svg",
    "images/products/samsung-case-s25-ultra-4.svg"
  ],
  "samsung-s24-fe": [
    "images/products/samsung-s24-fe-1.webp",
    "images/products/samsung-s24-fe-2.webp",
    "images/products/samsung-s24-fe-3.webp",
    "images/products/samsung-s24-fe-4.webp"
  ],
  "samsung-s25-plus": [
    "images/products/samsung-s25-plus-1.webp",
    "images/products/samsung-s25-plus-2.jpg",
    "images/products/samsung-s25-plus-3.svg",
    "images/products/samsung-s25-plus-4.svg"
  ],
  "samsung-s25-ultra": [
    "images/products/samsung-s25-ultra-1.webp",
    "images/products/samsung-s25-ultra-2.webp",
    "images/products/samsung-s25-ultra-3.webp",
    "images/products/samsung-s25-ultra-4.webp"
  ],
  "samsung-tab-a9": [
    "images/products/samsung-tab-a9-1.svg",
    "images/products/samsung-tab-a9-2.svg",
    "images/products/samsung-tab-a9-3.svg",
    "images/products/samsung-tab-a9-4.svg"
  ],
  "samsung-tab-a9-plus": [
    "images/products/samsung-tab-a9-plus-1.svg",
    "images/products/samsung-tab-a9-plus-2.svg",
    "images/products/samsung-tab-a9-plus-3.svg",
    "images/products/samsung-tab-a9-plus-4.svg"
  ],
  "samsung-tab-s10-plus": [
    "images/products/samsung-tab-s10-plus-1.svg",
    "images/products/samsung-tab-s10-plus-2.svg",
    "images/products/samsung-tab-s10-plus-3.svg",
    "images/products/samsung-tab-s10-plus-4.svg"
  ],
  "samsung-tab-s10-ultra": [
    "images/products/samsung-tab-s10-ultra-1.svg",
    "images/products/samsung-tab-s10-ultra-2.svg",
    "images/products/samsung-tab-s10-ultra-3.svg",
    "images/products/samsung-tab-s10-ultra-4.svg"
  ],
  "samsung-tab-s9-fe": [
    "images/products/samsung-tab-s9-fe-1.svg",
    "images/products/samsung-tab-s9-fe-2.svg",
    "images/products/samsung-tab-s9-fe-3.svg",
    "images/products/samsung-tab-s9-fe-4.svg"
  ],
  "samsung-watch-6-classic": [
    "images/products/samsung-watch-6-classic-1.svg",
    "images/products/samsung-watch-6-classic-2.svg",
    "images/products/samsung-watch-6-classic-3.svg",
    "images/products/samsung-watch-6-classic-4.svg"
  ],
  "samsung-watch-7": [
    "images/products/samsung-watch-7-1.svg",
    "images/products/samsung-watch-7-2.svg",
    "images/products/samsung-watch-7-3.svg",
    "images/products/samsung-watch-7-4.svg"
  ],
  "samsung-watch-ultra": [
    "images/products/samsung-watch-ultra-1.svg",
    "images/products/samsung-watch-ultra-2.svg",
    "images/products/samsung-watch-ultra-3.svg",
    "images/products/samsung-watch-ultra-4.svg"
  ],
  "sony-wf-1000xm5": [
    "images/products/sony-wf-1000xm5-1.svg",
    "images/products/sony-wf-1000xm5-2.svg",
    "images/products/sony-wf-1000xm5-3.svg",
    "images/products/sony-wf-1000xm5-4.svg"
  ],
  "sony-wh-1000xm5": [
    "images/products/sony-wh-1000xm5-1.svg",
    "images/products/sony-wh-1000xm5-2.svg",
    "images/products/sony-wh-1000xm5-3.svg",
    "images/products/sony-wh-1000xm5-4.svg"
  ],
  "sony-wh-ch720n": [
    "images/products/sony-wh-ch720n-1.svg",
    "images/products/sony-wh-ch720n-2.svg",
    "images/products/sony-wh-ch720n-3.svg",
    "images/products/sony-wh-ch720n-4.svg"
  ],
  "tesco-10000": [
    "images/products/tesco-10000-1.svg",
    "images/products/tesco-10000-2.svg",
    "images/products/tesco-10000-3.svg",
    "images/products/tesco-10000-4.svg"
  ],
  "tesco-20000": [
    "images/products/tesco-20000-1.svg",
    "images/products/tesco-20000-2.svg",
    "images/products/tesco-20000-3.svg",
    "images/products/tesco-20000-4.svg"
  ],
  "xiaomi-10000-pb": [
    "images/products/xiaomi-10000-pb-1.svg",
    "images/products/xiaomi-10000-pb-2.svg",
    "images/products/xiaomi-10000-pb-3.svg",
    "images/products/xiaomi-10000-pb-4.svg"
  ],
  "xiaomi-14": [
    "images/products/xiaomi-14-1.webp",
    "images/products/xiaomi-14-2.webp",
    "images/products/xiaomi-14-3.webp",
    "images/products/xiaomi-14-4.webp"
  ],
  "xiaomi-14-ultra": [
    "images/products/xiaomi-14-ultra-1.png",
    "images/products/xiaomi-14-ultra-2.jpg",
    "images/products/xiaomi-14-ultra-3.jpg",
    "images/products/xiaomi-14-ultra-4.jpg"
  ],
  "xiaomi-20000-50w": [
    "images/products/xiaomi-20000-50w-1.svg",
    "images/products/xiaomi-20000-50w-2.svg",
    "images/products/xiaomi-20000-50w-3.svg",
    "images/products/xiaomi-20000-50w-4.svg"
  ],
  "xiaomi-case-14-ultra": [
    "images/products/xiaomi-case-14-ultra-1.svg",
    "images/products/xiaomi-case-14-ultra-2.svg",
    "images/products/xiaomi-case-14-ultra-3.svg",
    "images/products/xiaomi-case-14-ultra-4.svg"
  ],
  "xiaomi-case-note-13-pro": [
    "images/products/xiaomi-case-note-13-pro-1.svg",
    "images/products/xiaomi-case-note-13-pro-2.svg",
    "images/products/xiaomi-case-note-13-pro-3.svg",
    "images/products/xiaomi-case-note-13-pro-4.svg"
  ],
  "xo-be36": [
    "images/products/xo-be36-1.svg",
    "images/products/xo-be36-2.svg",
    "images/products/xo-be36-3.svg",
    "images/products/xo-be36-4.svg"
  ],
  "xo-ev51": [
    "images/products/xo-ev51-1.svg",
    "images/products/xo-ev51-2.svg",
    "images/products/xo-ev51-3.svg",
    "images/products/xo-ev51-4.svg"
  ],
  "samsung-a36": ["images/products/samsung-a36-1.webp","images/products/samsung-a36-2.webp","images/products/samsung-a36-3.webp","images/products/samsung-a36-4.webp"],

  "iphone-17": ["images/products/iphone-17.svg"],
  "iphone-17-pro-max": ["images/products/iphone-17-pro-max.svg"],
  "iphone-13": ["images/products/iphone-13.svg"],
  "iphone-14": ["images/products/iphone-14.svg"],
  "samsung-s26-ultra": ["images/products/samsung-s26-ultra.svg"],
  "samsung-s24-ultra": ["images/products/samsung-s24-ultra.svg"],
  "samsung-s23": ["images/products/samsung-s23.svg"],
  "dell-inspiron-15": ["images/products/dell-inspiron-15.svg"],
  "dell-g15": ["images/products/dell-g15.svg"],
  "gaming-keyboard": ["images/products/gaming-keyboard.svg"],
  "gaming-mouse": ["images/products/gaming-mouse.svg"],
  "usb-c-hub": ["images/products/usb-c-hub.svg"],
  "laptop-cooling-pad": ["images/products/laptop-cooling-pad.svg"],
  "gaming-controller": ["images/products/gaming-controller.svg"],
  "gaming-headset": ["images/products/gaming-headset.svg"],
  "gaming-monitor": ["images/products/gaming-monitor.svg"],
  "pc-ram-ddr5": ["images/products/pc-ram-ddr5.svg"],
  "pc-ssd-nvme": ["images/products/pc-ssd-nvme.svg"],
  "pc-gpu": ["images/products/pc-gpu.svg"],
  "pc-cpu": ["images/products/pc-cpu.svg"],
  "pc-motherboard": ["images/products/pc-motherboard.svg"],
  "screen-protector": ["images/products/screen-protector.svg"]
};
/*MAP-END*/
function apply(){
  if(!Array.isArray(window.ALL_PRODUCTS)) return;
  window.ALL_PRODUCTS.forEach(p=>{
    const key=p.imageKey || p.id;
    const images=MAP[key];
    const customImage = p.image && p.image !== FALLBACK && !String(p.image).includes('placeholder-product');
    const customGallery = Array.isArray(p.images) && p.images.length && p.images.some(src => src && !String(src).includes('placeholder-product'));
    if(images && images.length && !customImage && !customGallery){ p.images=images.slice(0,50); p.image=p.images[0]; }
    else if(customGallery){ p.image=p.image || p.images[0]; }
    else if(!Array.isArray(p.images) || !p.images.length){ p.images=[p.image || FALLBACK]; }
  });
}
apply();
document.addEventListener("DOMContentLoaded",apply);
window.ProductImages={fallback:FALLBACK,map:MAP,maxImages:50,resolve:p=>p&&p.image||FALLBACK,hydrateAllProducts:apply};
window.resolveProductImage=window.ProductImages.resolve;
document.addEventListener("error",e=>{const i=e.target;if(i&&i.tagName==="IMG"&&!i.dataset.fallbackDone){i.dataset.fallbackDone="1";i.src=FALLBACK;}},true);
})();
