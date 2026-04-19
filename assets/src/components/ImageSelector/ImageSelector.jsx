import { useState } from "react";
import { Radio, RadioGroup } from "@douyinfe/semi-ui";

const CATEGORIES = ["All", "Nature", "Architecture", "Abstract", "People"];

const IMAGES = [
  { id: 1,  title: "Alpine Meadow",   cat: "Nature",       src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
  { id: 2,  title: "Forest Path",     cat: "Nature",       src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80" },
  { id: 3,  title: "Ocean Waves",     cat: "Nature",       src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80" },
  { id: 4,  title: "Desert Dunes",    cat: "Nature",       src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80" },
  { id: 5,  title: "Glass Tower",     cat: "Architecture", src: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80" },
  { id: 6,  title: "Urban Bridge",    cat: "Architecture", src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80" },
  { id: 7,  title: "Old Cathedral",   cat: "Architecture", src: "https://images.unsplash.com/photo-1543459176-4426b37223ba?w=400&q=80" },
  { id: 8,  title: "Neon Grid",       cat: "Abstract",     src: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&q=80" },
  { id: 9,  title: "Color Burst",     cat: "Abstract",     src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80" },
  { id: 10, title: "Geometric Flow",  cat: "Abstract",     src: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=400&q=80" },
  { id: 11, title: "Silhouette",      cat: "People",       src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80" },
  { id: 12, title: "Candid Moment",   cat: "People",       src: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&q=80" },
];

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0d0d10",
    minHeight: "100vh",
    color: "#f0f0f5",
    padding: "48px 24px 80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: { textAlign: "center", marginBottom: 48 },
  h1: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 400,
    color: "#f0f0f5",
    lineHeight: 1.1,
    marginBottom: 8,
  },
  accent: { color: "#c9f542", fontStyle: "italic" },
  subtitle: { color: "#7a7a8c", fontSize: "0.9rem", fontWeight: 300 },
  wrapper: { width: "100%", maxWidth: 900 },
  catBar: { marginBottom: 32 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  cardBase: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
    border: "1.5px solid #2e2e38",
    background: "#18181d",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.25s ease, border-color 0.2s ease",
  },
  cardSelected: {
    borderColor: "#22c55e",
    borderWidth: "5px",
  },
  cardImg: { width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" },
  cardBody: { padding: "12px 14px" },
  cardTitle: {
    fontSize: "0.88rem",
    fontWeight: 500,
    color: "#f0f0f5",
    margin: 0,
    marginBottom: 2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardCat: { fontSize: "0.75rem", color: "#7a7a8c" },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 2,
    transition: "opacity 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
  },
  footer: {
    marginTop: 36,
    padding: "20px 24px",
    background: "#18181d",
    border: "1.5px solid #2e2e38",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "border-color 0.3s ease",
  },
  footerActive: { borderColor: "#c9f542" },
  footerThumb: {
    width: 52,
    height: 40,
    borderRadius: 8,
    objectFit: "cover",
    background: "#222228",
    flexShrink: 0,
  },
  footerInfo: { flex: 1 },
  footerLabel: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#7a7a8c",
    fontWeight: 500,
  },
  footerValue: { fontSize: "0.95rem", fontWeight: 500, color: "#f0f0f5", marginTop: 2 },
  btn: {
    padding: "10px 24px",
    borderRadius: 100,
    border: "none",
    background: "#c9f542",
    color: "#0d0d10",
    fontSize: "0.88rem",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    flexShrink: 0,
    transition: "opacity 0.2s, transform 0.15s",
  },
  btnDisabled: { opacity: 0.35, pointerEvents: "none" },
  toast: {
    position: "fixed",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#c9f542",
    color: "#0d0d10",
    fontWeight: 600,
    fontSize: "0.88rem",
    padding: "12px 24px",
    borderRadius: 100,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    zIndex: 999,
    transition: "opacity 0.3s, transform 0.3s",
  },
};

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ImageCard({ image, selected, onSelect, idField = "id" }) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    ...styles.cardBase,
    ...(selected ? styles.cardSelected : {}),
    ...(hovered && !selected ? { transform: "translateY(-3px)", borderColor: "#4a4a58" } : {}),
  };

  const imageId = image[idField];

  return (
    <div
      style={cardStyle}
      onClick={() => onSelect(imageId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hidden native radio for accessibility */}
      <input
        type="radio"
        name="imageSelect"
        value={imageId}
        checked={selected}
        onChange={() => onSelect(imageId)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        aria-label={image.title}
      />

      {/* Checkmark badge */}
      <div style={{
        ...styles.badge,
        opacity: selected ? 1 : 0,
        transform: selected ? "scale(1)" : "scale(0.6)",
      }}>
        <CheckIcon />
      </div>

      <img src={image.src} alt={image.title} style={styles.cardImg} loading="lazy" />

      <div style={styles.cardBody}>
        <p style={styles.cardTitle}>{image.title}</p>
        <span style={styles.cardCat}>{image.cat}</span>
      </div>
    </div>
  );
}

export function ImageSelector({ images, selectedId, onSelect, idField = "id" }) {
  return (
    <div style={styles.grid}>
      {images.map(img => (
        <ImageCard
          key={img[idField]}
          image={img}
          selected={selectedId === img[idField]}
          onSelect={onSelect}
          idField={idField}
        />
      ))}
    </div>
  );
}

export default function ImageSelectorStandalone() {
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState({ visible: false, msg: "" });

  const filtered = category === "All" ? IMAGES : IMAGES.filter(i => i.cat === category);
  const selectedImage = IMAGES.find(i => i.id === selectedId);

  const showToast = (msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg: "" }), 2800);
  };

  const handleConfirm = () => {
    if (selectedImage) showToast(`✓ "${selectedImage.title}" selected`);
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <div style={styles.root}>
        <header style={styles.header}>
          <h1 style={styles.h1}>
            Pick an <em style={styles.accent}>Image</em>
          </h1>
          <p style={styles.subtitle}>Browse by category · Select one · Confirm your choice</p>
        </header>

        <div style={styles.wrapper}>
          {/* Category filter — Semi Design RadioGroup button style */}
          <div style={styles.catBar}>
            <RadioGroup
              type="button"
              buttonSize="middle"
              value={category}
              onChange={e => {
                setCategory(e.target.value);
              }}
              aria-label="Category filter"
              name="category-filter"
            >
              {CATEGORIES.map(cat => (
                <Radio key={cat} value={cat}>{cat}</Radio>
              ))}
            </RadioGroup>
          </div>

          {/* Image grid — use controlled ImageSelector */}
          <ImageSelector
            images={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Selection footer */}
          <div style={{ ...styles.footer, ...(selectedImage ? styles.footerActive : {}) }}>
            {selectedImage ? (
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                style={styles.footerThumb}
              />
            ) : (
              <div style={{ ...styles.footerThumb, background: "#222228" }} />
            )}

            <div style={styles.footerInfo}>
              <div style={styles.footerLabel}>Selected image</div>
              <div style={styles.footerValue}>
                {selectedImage ? `${selectedImage.title} · ${selectedImage.cat}` : "None selected"}
              </div>
            </div>

            <button
              style={{ ...styles.btn, ...(selectedImage ? {} : styles.btnDisabled) }}
              onClick={handleConfirm}
              disabled={!selectedImage}
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Toast */}
        <div style={{
          ...styles.toast,
          opacity: toast.visible ? 1 : 0,
          transform: `translateX(-50%) translateY(${toast.visible ? 0 : 20}px)`,
        }}>
          {toast.msg}
        </div>
      </div>
    </>
  );
}
