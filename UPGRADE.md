# Backlog — Outils à ajouter

Idées d'outils supplémentaires pour la toolbox.

## Historique (terminé)

<details>
<summary>Vague 1 — 24 outils (toutes catégories cochées, voir git log)</summary>

- Images — édition : rogner, redimensionner, pivoter/retourner, filigrane, luminosité/contraste/saturation en lot
- Images — assets pour le dev : favicon.ico, pack d'icônes PWA, WebP/AVIF, srcset, LQIP, base64, spritesheet, optimisation SVG, conversion SVG/PNG
- Images — analyse : palette de couleurs dominante, comparaison visuelle de deux images
- Vidéo : conversion de format, compression, extraction de frame, concaténation, gestion de la piste audio
- Divers : QR code, images ↔ PDF, renommage en lot

</details>

## Images — avancé

- [x] Supprimer les métadonnées EXIF d'une image (vie privée avant partage)
- [x] Extraire les métadonnées EXIF (date, appareil, position GPS...)
- [x] Convertir HEIC/HEIF (photos iPhone) vers JPEG/PNG — support ajouté à l'outil "Convertir" existant
- [x] Redresser une image (correction d'inclinaison, auto-détectée via OpenCV — pas de correction de perspective manuelle à 4 points)
- [x] Réduire le bruit d'une image (denoise, Non-Local Means via OpenCV)
- [x] Générer une planche contact (grille de miniatures à partir d'un lot de photos)
- [x] Détourage précis avec alpha matting (bords fins : cheveux, fourrure...) — option ajoutée à l'outil "Remove BG" existant

## Images — réseaux sociaux

- [x] Générer les formats réseaux sociaux en un clic (post Instagram carré, story 9:16, bannière LinkedIn, carte Twitter/X, image OG) à partir d'une seule image source
- [x] Générer une image placeholder avec texte personnalisé (type placehold.co)

## Vidéo — avancé

- [ ] Extraire la piste audio d'une vidéo en fichier séparé (mp3/wav)
- [ ] Accélérer / ralentir une vidéo
- [ ] Incruster des sous-titres (fichier .srt) dans une vidéo
- [ ] Générer une boucle vidéo parfaite (avec cross-fade)
- [ ] Générer une visualisation waveform de la piste audio

## PDF

- [ ] Fusionner plusieurs PDF en un seul
- [ ] Compresser un PDF (réduire le poids)

## Divers

- [ ] Calculer le hash d'un fichier (MD5/SHA-256)
- [ ] Vérifier le contraste de deux couleurs (accessibilité WCAG)

---

Pas d'ordre de priorité fixé — à trier selon les besoins du moment. Les cases se cochent au fur et à mesure de l'implémentation, comme la liste de départ.
