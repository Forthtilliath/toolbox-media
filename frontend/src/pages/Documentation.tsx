import { Link } from 'react-router-dom'

interface ToolDoc {
  to: string
  label: string
  description: string
}

interface CategoryDoc {
  title: string
  intro: string
  tools: ToolDoc[]
  screenshot?: { src: string; alt: string }
}

const categories: CategoryDoc[] = [
  {
    title: "Retouche d'image",
    intro: "Les opérations de base pour préparer une image : recadrage, dimensions, format, poids.",
    tools: [
      { to: '/remove-background', label: 'Remove BG', description: "Supprime le fond d'une image (modèle U2Net, via rembg). Option détourage précis (alpha matting) pour les bords fins comme les cheveux." },
      { to: '/crop-image', label: 'Rogner', description: 'Ratio prédéfini (1:1, 4:3, 16:9) centré automatiquement, ou zone manuelle en pixels (x, y, largeur, hauteur).' },
      { to: '/resize-image', label: 'Redimensionner', description: 'Par pourcentage, ou par dimensions en pixels avec ou sans conservation du ratio.' },
      { to: '/rotate-flip-image', label: 'Pivoter / retourner', description: 'Rotation à angle libre (sens horaire) et/ou retournement horizontal/vertical.' },
      { to: '/deskew', label: 'Redresser', description: "Corrige automatiquement l'inclinaison d'une image (détection du plus grand rectangle englobant via OpenCV) — pensé pour les documents scannés." },
      { to: '/denoise', label: 'Réduire le bruit', description: "Débruitage via l'algorithme Non-Local Means (OpenCV), intensité réglable." },
      { to: '/compress-image', label: 'Compresser', description: "Réduit le poids d'un fichier via un curseur de qualité (JPEG/WebP)." },
      { to: '/convert-image', label: 'Convertir', description: 'Change le format entre JPEG, PNG, WebP et AVIF. Accepte aussi les photos HEIC/HEIF (iPhone) en entrée.' },
      { to: '/watermark', label: 'Filigrane', description: "Ajoute un texte ou un logo sur un lot d'images, avec position (5 emplacements) et opacité réglables." },
      { to: '/adjust-images', label: 'Luminosité / contraste / saturation', description: "Ajustement manuel appliqué à un lot d'images avec les mêmes réglages (curseurs 0-200%), transparence préservée." },
      { to: '/strip-exif', label: 'Supprimer EXIF', description: "Retire toutes les métadonnées (appareil, date, position GPS...) avant de partager une photo." },
      { to: '/extract-exif', label: 'Extraire EXIF', description: "Lit les métadonnées d'une image : appareil, date de prise de vue, et coordonnées GPS converties en décimal si présentes." },
      { to: '/contact-sheet', label: 'Planche contact', description: "Assemble un lot de photos en une grille de miniatures uniformes, nombre de colonnes et taille réglables." },
    ],
  },
  {
    title: 'Uniformisation par lot',
    intro: "Aligner un groupe de photos entre elles pour un rendu cohérent (portfolio, catalogue, réseau social).",
    tools: [
      { to: '/color-match', label: 'Uniformiser teintes', description: "Recale toute la distribution de couleurs d'un lot de photos sur une image de référence (histogram matching)." },
      { to: '/brightness-match', label: 'Uniformiser luminosité', description: "Aligne uniquement la luminance (espace LAB) sur la moyenne du lot ou sur une référence, sans toucher aux teintes ni à la saturation — plus léger que l'uniformisation de teintes." },
    ],
  },
  {
    title: 'Assets pour le développement web',
    intro: "Générer directement les fichiers dont un site ou une app a besoin, à partir d'une image source.",
    tools: [
      { to: '/icon-pack', label: 'Favicon / pack icônes', description: 'favicon.ico multi-résolution (16/32/48), ou pack complet (apple-touch-icon 180px, icônes PWA 192/512, manifest.json prêt à l\'emploi).' },
      { to: '/srcset', label: 'Srcset responsive', description: "Génère plusieurs largeurs d'une même image (jamais d'agrandissement au-delà de la source) et l'attribut srcset correspondant." },
      { to: '/lqip', label: 'Placeholder flou (LQIP)', description: 'Mini version floutée de l\'image encodée en data URI, pour afficher un aperçu pendant le chargement (lazy loading).' },
      { to: '/base64-encode', label: 'Encoder en base64', description: 'Data URI directe du fichier, pour l\'inliner dans du CSS ou du HTML.' },
      { to: '/spritesheet', label: 'Spritesheet CSS', description: "Assemble plusieurs icônes en une seule image, avec les règles CSS background-position correspondantes." },
      { to: '/svg-optimize', label: 'Optimiser SVG', description: 'Nettoyage et minification (suppression des commentaires, raccourcissement des identifiants) via scour.' },
      { to: '/svg-convert', label: 'Convertir SVG ↔ PNG', description: 'Rasterise un SVG en PNG à une largeur donnée, ou encapsule un PNG dans un fichier SVG (pas une vraie vectorisation).' },
      { to: '/social-formats', label: 'Formats réseaux sociaux', description: "Produit 5 recadrages à partir d'une image source : post Instagram carré (1080×1080), story 9:16 (1080×1920), bannière LinkedIn (1584×396), carte Twitter/X (1200×675) et image Open Graph (1200×630)." },
      { to: '/placeholder', label: 'Image placeholder', description: "Génère une image de remplacement (type placehold.co) : dimensions, couleurs et texte personnalisables." },
    ],
  },
  {
    title: "Analyse d'image",
    intro: 'Extraire des informations objectives sur une ou plusieurs images.',
    tools: [
      { to: '/color-palette', label: 'Palette de couleurs', description: 'Extrait les couleurs dominantes (quantification) avec leur pourcentage de présence.' },
      { to: '/compare-images', label: 'Comparer deux images', description: "Score de similarité structurelle (SSIM) entre 0 et 1, accompagné d'une heatmap qui localise les zones qui diffèrent." },
    ],
    screenshot: { src: '/screenshots/compare-images.png', alt: 'Résultat de la comparaison de deux images avec heatmap des différences' },
  },
  {
    title: 'Vidéo',
    intro: 'Traitement vidéo via ffmpeg : découpe, conversion, compression, extraction, montage simple.',
    tools: [
      { to: '/trim-video', label: 'Couper un extrait', description: 'Découpe entre deux timestamps (début/fin en secondes).' },
      { to: '/video-to-gif', label: 'Vidéo → GIF', description: 'Convertit un extrait en GIF optimisé (palette de couleurs dédiée pour un meilleur rendu).' },
      { to: '/convert-video', label: 'Convertir', description: 'Change le conteneur/codec entre mp4, webm, mov, mkv et avi.' },
      { to: '/compress-video', label: 'Compresser', description: 'Bitrate vidéo cible et/ou largeur maximale, pour réduire le poids du fichier.' },
      { to: '/extract-frame', label: 'Extraire une frame', description: 'Récupère une image fixe (PNG) à un instant précis de la vidéo.' },
      { to: '/concat-videos', label: 'Concaténer', description: "Met bout à bout plusieurs extraits ; la résolution et le fps sont normalisés automatiquement sur le premier clip. Chaque clip doit avoir une piste audio." },
      { to: '/audio-track', label: 'Piste audio', description: "Retire la piste audio d'une vidéo, ou la remplace/ajoute à partir d'un fichier audio séparé." },
      { to: '/extract-audio', label: 'Extraire audio', description: "Exporte la piste audio d'une vidéo en fichier séparé, MP3 ou WAV." },
      { to: '/video-speed', label: 'Vitesse vidéo', description: "Accélère ou ralentit une vidéo entre 0.5x et 2x (limite du filtre atempo en un seul passage), image et son synchronisés." },
      { to: '/subtitles', label: 'Sous-titres', description: "Incruste un fichier de sous-titres .srt directement dans l'image de la vidéo (rendu via libass)." },
      { to: '/video-loop', label: 'Boucle vidéo', description: "Fondu enchaîné entre la fin et le début de la vidéo pour une lecture en boucle sans coupure visible. Vidéo uniquement, la piste audio n'est pas conservée." },
      { to: '/waveform', label: 'Waveform audio', description: "Génère une image statique de la forme d'onde de la piste audio, dimensions réglables." },
    ],
  },
  {
    title: 'Documents & utilitaires',
    intro: 'Petits outils complémentaires qui ne rentrent pas dans les catégories ci-dessus.',
    tools: [
      { to: '/qrcode', label: 'QR code', description: "Génère un QR code à partir d'un texte ou d'une URL, taille des modules réglable." },
      { to: '/images-to-pdf', label: 'Images vers PDF', description: 'Assemble plusieurs images en un seul PDF multi-pages, dans l\'ordre choisi.' },
      { to: '/pdf-to-images', label: 'PDF vers images', description: 'Extrait chaque page d\'un PDF en image PNG, à une résolution (DPI) réglable.' },
      { to: '/rename-files', label: 'Renommer en lot', description: 'Renomme plusieurs fichiers selon un pattern ({n}, {n:03d}, {name}, {ext}) ; les collisions de noms sont automatiquement désambiguïsées.' },
    ],
    screenshot: { src: '/screenshots/qrcode.png', alt: 'QR code généré à partir d\'une URL' },
  },
]

export default function Documentation() {
  return (
    <section>
      <h2>Guide complet des outils</h2>
      <p>
        Toolbox Media regroupe {categories.reduce((n, c) => n + c.tools.length, 0)} outils de traitement
        d'image et de vidéo, organisés en {categories.length} catégories. Chaque outil est une page
        indépendante : upload du ou des fichiers, réglage des paramètres, et téléchargement du résultat.
      </p>

      {categories.map((category) => (
        <div key={category.title} className="doc-category">
          <h3>{category.title}</h3>
          <p>{category.intro}</p>
          <dl>
            {category.tools.map((tool) => (
              <div key={tool.to} className="doc-tool">
                <dt>
                  <Link to={tool.to}>{tool.label}</Link>
                </dt>
                <dd>{tool.description}</dd>
              </div>
            ))}
          </dl>
          {category.screenshot && (
            <img
              className="doc-screenshot"
              src={category.screenshot.src}
              alt={category.screenshot.alt}
              loading="lazy"
            />
          )}
        </div>
      ))}
    </section>
  )
}
