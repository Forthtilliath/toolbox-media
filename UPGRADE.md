# Backlog — Outils à ajouter

Idées d'outils supplémentaires pour la toolbox, en plus des 6 outils déjà implémentés (remove bg, uniformiser teintes, compresser image, convertir format, couper vidéo, vidéo → gif).

## Images — édition

- [x] Rogner une image (crop libre + ratios prédéfinis 1:1, 4:3, 16:9)
- [x] Redimensionner une image (dimensions fixes ou %, avec/sans conservation du ratio)
- [x] Pivoter / retourner une image (rotation, flip horizontal/vertical)
- [x] Ajouter un filigrane (texte ou logo) sur un lot d'images
- [x] Ajuster luminosité / contraste / saturation en lot

## Images — assets pour le dev

- [x] Générer un favicon.ico multi-résolution (16x16, 32x32, 48x48) depuis une image source
- [x] Générer un pack d'icônes complet (favicon.ico, apple-touch-icon, icônes PWA 192/512, manifest.json) depuis une seule image source
- [x] Convertir en WebP / AVIF (formats modernes, en complément de jpeg/png/webp déjà couverts)
- [x] Générer un jeu d'images responsive (srcset : plusieurs tailles à partir d'une image source)
- [x] Générer un placeholder flou (LQIP / blurhash) pour le lazy loading
- [x] Encoder une image en base64 (data URI) pour inline CSS/HTML
- [x] Assembler un spritesheet CSS depuis plusieurs icônes
- [x] Optimiser un SVG (nettoyage, minification — type SVGO)
- [x] Convertir SVG ↔ PNG/raster

## Images — analyse

- [x] Extraire la palette de couleurs dominante d'une image
- [x] Comparer deux images (diff visuel, utile pour de la review de design)

## Vidéo

- [x] Convertir un format vidéo (mp4 ↔ webm, etc.)
- [x] Compresser une vidéo (ajuster bitrate/résolution cible)
- [x] Extraire une frame/thumbnail à un timestamp donné
- [x] Concaténer plusieurs extraits vidéo bout à bout
- [x] Ajouter/retirer la piste audio d'une vidéo

## Divers

- [x] Générer un QR code
- [x] Convertir des images en PDF / extraire les pages d'un PDF en images
- [x] Renommer un lot de fichiers selon un pattern

---

Pas d'ordre de priorité fixé — à trier selon les besoins du moment. Les cases se cochent au fur et à mesure de l'implémentation, comme la liste de départ.
