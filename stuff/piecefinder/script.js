/* ===================================================================
   Puzzle Piece Locator — client-side template matching with OpenCV.js
   =================================================================== */

// --------------- DOM refs ---------------
const fullImageInput   = document.getElementById("fullImageInput");
const pieceImageInput  = document.getElementById("pieceImageInput");
const fullImagePreview = document.getElementById("fullImagePreview");
const pieceImagePreview= document.getElementById("pieceImagePreview");
const fullImageDrop    = document.getElementById("fullImageDrop");
const pieceImageDrop   = document.getElementById("pieceImageDrop");
const fullPasteBtn     = document.getElementById("fullPasteBtn");
const piecePasteBtn    = document.getElementById("piecePasteBtn");
const analyzeBtn       = document.getElementById("analyzeBtn");
const clearBtn         = document.getElementById("clearBtn");
const rotationCheck    = document.getElementById("rotationCheck");
const trimCheck        = document.getElementById("trimCheck");
const multiMatchCheck  = document.getElementById("multiMatchCheck");
const statusEl         = document.getElementById("status");
const progressBar      = document.getElementById("progressBar");
const progressFill     = document.getElementById("progressFill");
const resultsSection   = document.getElementById("resultsSection");
const resultInfo       = document.getElementById("resultInfo");
const resultCanvas     = document.getElementById("resultCanvas");
const matchList        = document.getElementById("matchList");

// --------------- State ---------------
let fullImage  = null; // HTMLImageElement
let pieceImage = null;
let cvReady    = false;

// --------------- OpenCV ready detection ---------------
function waitForOpenCV() {
  return new Promise((resolve) => {
    if (typeof cv !== "undefined" && cv.Mat) {
      cvReady = true;
      resolve();
      return;
    }
    // OpenCV.js sets cv as a Module; when it's truly ready, cv.Mat exists
    const check = setInterval(() => {
      if (typeof cv !== "undefined" && cv.Mat) {
        clearInterval(check);
        cvReady = true;
        resolve();
      }
    }, 100);
  });
}

// Also handle the onRuntimeInitialized callback pattern
if (typeof cv === "undefined") {
  // cv not loaded yet — the script tag is async
  document.getElementById("opencvScript").addEventListener("load", () => {
    if (cv.getBuildInformation) {
      cvReady = true;
    } else {
      cv["onRuntimeInitialized"] = () => { cvReady = true; };
    }
  });
}

// --------------- Helpers ---------------

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = "status " + (type || "");
  statusEl.classList.remove("hidden");
}

function hideStatus() {
  statusEl.classList.add("hidden");
}

function showProgress(pct) {
  progressBar.classList.remove("hidden");
  progressFill.style.width = pct + "%";
}

function hideProgress() {
  progressBar.classList.add("hidden");
  progressFill.style.width = "0%";
}

function updateAnalyzeButton() {
  analyzeBtn.disabled = !(fullImage && pieceImage);
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

/** Resize an image so its longest side is at most maxDim. Returns a canvas. */
function constrainSize(img, maxDim) {
  let w = img.naturalWidth || img.width;
  let h = img.naturalHeight || img.height;
  if (w <= maxDim && h <= maxDim) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(img, 0, 0);
    return c;
  }
  const scale = maxDim / Math.max(w, h);
  const nw = Math.round(w * scale);
  const nh = Math.round(h * scale);
  const c = document.createElement("canvas");
  c.width = nw;
  c.height = nh;
  c.getContext("2d").drawImage(img, 0, 0, nw, nh);
  return c;
}

// --------------- Drag & drop ---------------

function setupDropZone(dropEl, inputEl, onFile) {
  ["dragenter", "dragover"].forEach(evt => {
    dropEl.addEventListener(evt, (e) => { e.preventDefault(); dropEl.classList.add("drag-over"); });
  });
  ["dragleave", "drop"].forEach(evt => {
    dropEl.addEventListener(evt, () => dropEl.classList.remove("drag-over"));
  });
  dropEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });
  inputEl.addEventListener("change", () => {
    const file = inputEl.files[0];
    if (file) onFile(file);
  });
}

function setPreview(previewEl, img) {
  previewEl.src = img.src;
  previewEl.classList.remove("hidden");
  previewEl.previousElementSibling.classList.add("hidden"); // hide prompt
}

setupDropZone(fullImageDrop, fullImageInput, async (file) => {
  try {
    fullImage = await loadImageFromFile(file);
    setPreview(fullImagePreview, fullImage);
    updateAnalyzeButton();
  } catch (e) {
    showStatus("Could not load full image: " + e.message, "error");
  }
});

setupDropZone(pieceImageDrop, pieceImageInput, async (file) => {
  try {
    pieceImage = await loadImageFromFile(file);
    setPreview(pieceImagePreview, pieceImage);
    updateAnalyzeButton();
  } catch (e) {
    showStatus("Could not load piece image: " + e.message, "error");
  }
});

// --------------- Clear ---------------

clearBtn.addEventListener("click", () => {
  fullImage = null;
  pieceImage = null;
  fullImagePreview.classList.add("hidden");
  pieceImagePreview.classList.add("hidden");
  fullImageDrop.querySelector(".drop-zone-prompt").classList.remove("hidden");
  pieceImageDrop.querySelector(".drop-zone-prompt").classList.remove("hidden");
  fullImageInput.value = "";
  pieceImageInput.value = "";
  resultsSection.classList.add("hidden");
  hideStatus();
  hideProgress();
  updateAnalyzeButton();
});

// --------------- Paste support ---------------

// Track which slot a paste-button click should target
let pasteTarget = null;

// Hidden contenteditable element to capture paste events reliably
const pasteHelper = document.createElement("div");
pasteHelper.contentEditable = true;
pasteHelper.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;width:1px;height:1px;";
document.body.appendChild(pasteHelper);

async function handlePastedImage(file, target) {
  try {
    const img = await loadImageFromFile(file);
    if (target === "full") {
      fullImage = img;
      setPreview(fullImagePreview, fullImage);
    } else {
      pieceImage = img;
      setPreview(pieceImagePreview, pieceImage);
    }
    updateAnalyzeButton();
    hideStatus();
  } catch (err) {
    showStatus("Could not load pasted image: " + err.message, "error");
  }
}

// When paste button is clicked, focus the helper so the next Ctrl+V fires on it
fullPasteBtn.addEventListener("click", () => {
  pasteTarget = "full";
  pasteHelper.focus();
  showStatus("Now press Ctrl+V to paste your image into the Full Puzzle slot.", "");
});

piecePasteBtn.addEventListener("click", () => {
  pasteTarget = "piece";
  pasteHelper.focus();
  showStatus("Now press Ctrl+V to paste your image into the Piece slot.", "");
});

// Listen for paste on the whole document
document.addEventListener("paste", async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith("image/")) {
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) continue;

      // If a paste button was clicked, route to that target
      if (pasteTarget) {
        await handlePastedImage(file, pasteTarget);
        pasteTarget = null;
      } else {
        // Auto-route: first empty slot, or replace piece
        if (!fullImage) {
          await handlePastedImage(file, "full");
        } else {
          await handlePastedImage(file, "piece");
        }
      }
      break;
    }
  }
});

// --------------- Core: Template Matching ---------------

/**
 * Detect the background color by sampling pixels along all 4 borders
 * of the image. Returns [B, G, R] of the most common border color.
 */
function detectBgColor(src) {
  const rows = src.rows, cols = src.cols;
  const samples = [];

  // Sample every pixel on all 4 edges
  for (let c = 0; c < cols; c++) {
    samples.push(src.ucharPtr(0, c));            // top row
    samples.push(src.ucharPtr(rows - 1, c));     // bottom row
  }
  for (let r = 0; r < rows; r++) {
    samples.push(src.ucharPtr(r, 0));            // left col
    samples.push(src.ucharPtr(r, cols - 1));     // right col
  }

  // Average the border pixels (works well for solid bg)
  let sumB = 0, sumG = 0, sumR = 0;
  for (const px of samples) {
    sumB += px[0]; sumG += px[1]; sumR += px[2];
  }
  const n = samples.length;
  return [Math.round(sumB / n), Math.round(sumG / n), Math.round(sumR / n)];
}

/**
 * Create a binary mask from a piece image: 255 where the piece is, 0 for background.
 * Also trims the image and mask to the bounding box of the piece.
 * Returns { trimmedSrc, mask } — caller must delete both.
 */
function createPieceMask(src) {
  const [bgB, bgG, bgR] = detectBgColor(src);
  const tol = 35;

  // Build a difference image: how far each pixel is from the background color
  const rows = src.rows, cols = src.cols;
  const maskMat = new cv.Mat(rows, cols, cv.CV_8UC1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = src.ucharPtr(r, c);
      const diff = Math.abs(px[0] - bgB) + Math.abs(px[1] - bgG) + Math.abs(px[2] - bgR);
      maskMat.ucharPtr(r, c)[0] = diff > tol * 3 ? 255 : 0;
    }
  }

  // Morphological cleanup: close small holes, remove noise
  const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
  cv.morphologyEx(maskMat, maskMat, cv.MORPH_CLOSE, kernel);
  cv.morphologyEx(maskMat, maskMat, cv.MORPH_OPEN, kernel);
  kernel.delete();

  // Find bounding box of the mask to trim
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(maskMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let minR = rows, maxR = 0, minC = cols, maxC = 0;
  for (let i = 0; i < contours.size(); i++) {
    const br = cv.boundingRect(contours.get(i));
    minR = Math.min(minR, br.y);
    maxR = Math.max(maxR, br.y + br.height);
    minC = Math.min(minC, br.x);
    maxC = Math.max(maxC, br.x + br.width);
  }
  contours.delete();
  hierarchy.delete();

  // Fallback: if no contours found, return as-is with full mask
  if (maxR <= minR || maxC <= minC) {
    const fullMask = new cv.Mat(rows, cols, cv.CV_8UC1, new cv.Scalar(255));
    return { trimmedSrc: src.clone(), mask: fullMask, maskMat };
  }

  // Add 1px margin
  minR = Math.max(0, minR - 1);
  maxR = Math.min(rows, maxR + 1);
  minC = Math.max(0, minC - 1);
  maxC = Math.min(cols, maxC + 1);

  const rect = new cv.Rect(minC, minR, maxC - minC, maxR - minR);
  const trimmedSrc = src.roi(rect).clone();
  const trimmedMask = maskMat.roi(rect).clone();
  maskMat.delete();

  return { trimmedSrc, mask: trimmedMask };
}

/**
 * Auto-trim without mask (simple bounding box trim for when mask isn't needed).
 */
function autoTrimMat(src) {
  const { trimmedSrc, mask } = createPieceMask(src);
  mask.delete();
  return trimmedSrc;
}

/**
 * Rotate a mat by 90° increments. angle must be 0, 90, 180, 270.
 */
function rotateMat(src, angle) {
  if (angle === 0) return src.clone();
  const dst = new cv.Mat();
  if (angle === 90) {
    cv.transpose(src, dst);
    cv.flip(dst, dst, 1);
  } else if (angle === 180) {
    cv.flip(src, dst, -1);
  } else if (angle === 270) {
    cv.transpose(src, dst);
    cv.flip(dst, dst, 0);
  }
  return dst;
}

/**
 * Run masked template matching at one rotation.
 * Uses TM_CCORR_NORMED with a mask so background pixels are ignored.
 */
function matchAtRotation(fullGray, pieceColor, pieceMask, angle) {
  const rotatedPiece = rotateMat(pieceColor, angle);
  const rotatedMask = rotateMat(pieceMask, angle);

  let pieceGray = new cv.Mat();
  cv.cvtColor(rotatedPiece, pieceGray, cv.COLOR_RGBA2GRAY);

  // Ensure piece fits inside full image
  if (pieceGray.rows > fullGray.rows || pieceGray.cols > fullGray.cols) {
    pieceGray.delete();
    rotatedPiece.delete();
    rotatedMask.delete();
    return null;
  }

  const result = new cv.Mat();

  // Use masked template matching — TM_CCORR_NORMED supports masks
  // The mask must be single-channel and same size as template
  cv.matchTemplate(fullGray, pieceGray, result, cv.TM_CCORR_NORMED, rotatedMask);

  const minMax = cv.minMaxLoc(result);

  const ret = {
    maxVal: minMax.maxVal,
    maxLoc: { x: minMax.maxLoc.x, y: minMax.maxLoc.y },
    angle,
    pieceW: pieceGray.cols,
    pieceH: pieceGray.rows,
    resultMat: result,
  };

  pieceGray.delete();
  rotatedPiece.delete();
  rotatedMask.delete();
  return ret;
}

/**
 * Find top-N matches from a result matrix, suppressing overlapping detections.
 */
function findTopMatches(resultMat, n, pieceW, pieceH) {
  const matches = [];
  const tempResult = resultMat.clone();
  const suppressRadius = Math.max(pieceW, pieceH);

  for (let i = 0; i < n; i++) {
    const mm = cv.minMaxLoc(tempResult);
    if (mm.maxVal < 0.1) break; // no more meaningful matches
    matches.push({ x: mm.maxLoc.x, y: mm.maxLoc.y, confidence: mm.maxVal });
    // Suppress this region
    const x1 = Math.max(0, mm.maxLoc.x - suppressRadius);
    const y1 = Math.max(0, mm.maxLoc.y - suppressRadius);
    const x2 = Math.min(tempResult.cols, mm.maxLoc.x + suppressRadius);
    const y2 = Math.min(tempResult.rows, mm.maxLoc.y + suppressRadius);
    const roi = tempResult.roi(new cv.Rect(x1, y1, x2 - x1, y2 - y1));
    roi.setTo(new cv.Scalar(0));
    roi.delete();
  }
  tempResult.delete();
  return matches;
}

// --------------- Main analyze ---------------

analyzeBtn.addEventListener("click", async () => {
  if (!fullImage || !pieceImage) return;

  // Wait for OpenCV
  if (!cvReady) {
    showStatus("Loading OpenCV.js — please wait...", "");
    await waitForOpenCV();
  }

  hideStatus();
  showProgress(5);
  resultsSection.classList.add("hidden");
  analyzeBtn.disabled = true;

  try {
    showStatus("Preparing images...", "");
    showProgress(10);

    // --- Prepare full image ---
    const MAX_DIM = 1500;
    const fullCanvas = constrainSize(fullImage, MAX_DIM);
    const fullMat = cv.imread(fullCanvas);
    const fullGray = new cv.Mat();
    cv.cvtColor(fullMat, fullGray, cv.COLOR_RGBA2GRAY);

    // Scale factor for piece: if full image was downsized, piece should match
    const scaleRatio = fullCanvas.width / (fullImage.naturalWidth || fullImage.width);

    // --- Prepare piece image ---
    let pieceCanvas = document.createElement("canvas");
    const pw = Math.round((pieceImage.naturalWidth || pieceImage.width) * scaleRatio);
    const ph = Math.round((pieceImage.naturalHeight || pieceImage.height) * scaleRatio);
    pieceCanvas.width = pw;
    pieceCanvas.height = ph;
    pieceCanvas.getContext("2d").drawImage(pieceImage, 0, 0, pw, ph);
    let pieceMat = cv.imread(pieceCanvas);

    // Create mask and trim piece (removes background, keeps only piece shape)
    showStatus("Detecting piece shape & removing background...", "");
    showProgress(20);
    let pieceMask;
    if (trimCheck.checked) {
      const result = createPieceMask(pieceMat);
      pieceMat.delete();
      pieceMat = result.trimmedSrc;
      pieceMask = result.mask;
    } else {
      // No trim — full white mask (match everything)
      pieceMask = new cv.Mat(pieceMat.rows, pieceMat.cols, cv.CV_8UC1, new cv.Scalar(255));
    }

    // Ensure piece isn't larger than full image
    if (pieceMat.rows > fullGray.rows || pieceMat.cols > fullGray.cols) {
      const pScale = Math.min(fullGray.rows / pieceMat.rows, fullGray.cols / pieceMat.cols) * 0.9;
      const dst = new cv.Mat();
      const dstMask = new cv.Mat();
      const newSize = new cv.Size(
        Math.round(pieceMat.cols * pScale),
        Math.round(pieceMat.rows * pScale)
      );
      cv.resize(pieceMat, dst, newSize);
      cv.resize(pieceMask, dstMask, newSize, 0, 0, cv.INTER_NEAREST);
      pieceMat.delete();
      pieceMask.delete();
      pieceMat = dst;
      pieceMask = dstMask;
    }

    // --- Template matching (with optional rotations) ---
    const angles = rotationCheck.checked ? [0, 90, 180, 270] : [0];
    let bestResult = null;
    const allResults = [];

    showStatus("Running template matching...", "");

    for (let i = 0; i < angles.length; i++) {
      showProgress(30 + Math.round((i / angles.length) * 50));
      showStatus(`Matching at ${angles[i]}°...`, "");

      // Yield to UI
      await new Promise(r => setTimeout(r, 0));

      const res = matchAtRotation(fullGray, pieceMat, pieceMask, angles[i]);
      if (res) {
        allResults.push(res);
        if (!bestResult || res.maxVal > bestResult.maxVal) {
          bestResult = res;
        }
      }
    }

    showProgress(85);

    if (!bestResult) {
      showStatus("No match found — piece may be too large or incompatible.", "error");
      fullMat.delete();
      fullGray.delete();
      pieceMat.delete();
      pieceMask.delete();
      hideProgress();
      analyzeBtn.disabled = false;
      return;
    }

    // --- Draw results ---
    showStatus("Drawing results...", "");
    showProgress(90);

    // Multi-match
    let topMatches = [];
    if (multiMatchCheck.checked) {
      topMatches = findTopMatches(bestResult.resultMat, 5, bestResult.pieceW, bestResult.pieceH);
    } else {
      topMatches = [{ x: bestResult.maxLoc.x, y: bestResult.maxLoc.y, confidence: bestResult.maxVal }];
    }

    // --- Render base image then draw highlights with Canvas 2D ---
    resultCanvas.width = fullMat.cols;
    resultCanvas.height = fullMat.rows;
    cv.imshow(resultCanvas, fullMat);

    const ctx = resultCanvas.getContext("2d");
    const best = topMatches[0];
    const mw = bestResult.pieceW;
    const mh = bestResult.pieceH;

    // Darken the entire image except the best match area
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.rect(0, 0, resultCanvas.width, resultCanvas.height);
    // Cut out the best match region
    ctx.rect(best.x, best.y + mh, mw, -mh); // counter-winding to punch hole
    ctx.fill("evenodd");
    ctx.restore();

    // Draw secondary matches (yellow dashed)
    for (let i = topMatches.length - 1; i >= 1; i--) {
      const m = topMatches[i];
      ctx.save();
      ctx.strokeStyle = "#feca57";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(m.x, m.y, mw, mh);
      ctx.setLineDash([]);
      // Label background
      const label = `#${i + 1}  ${(m.confidence * 100).toFixed(0)}%`;
      ctx.font = "bold 14px sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(m.x, m.y - 22, tw + 12, 22);
      ctx.fillStyle = "#feca57";
      ctx.fillText(label, m.x + 6, m.y - 6);
      ctx.restore();
    }

    // Draw best match — bright green, thick, with corner brackets
    ctx.save();
    const green = "#00e6c8";
    const bx = best.x, by = best.y;

    // Glow effect
    ctx.shadowColor = green;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = green;
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, mw, mh);
    ctx.shadowBlur = 0;

    // Corner brackets for extra visibility
    const bracketLen = Math.min(20, mw / 3, mh / 3);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#fff";
    // Top-left
    ctx.beginPath(); ctx.moveTo(bx, by + bracketLen); ctx.lineTo(bx, by); ctx.lineTo(bx + bracketLen, by); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(bx + mw - bracketLen, by); ctx.lineTo(bx + mw, by); ctx.lineTo(bx + mw, by + bracketLen); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(bx, by + mh - bracketLen); ctx.lineTo(bx, by + mh); ctx.lineTo(bx + bracketLen, by + mh); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(bx + mw - bracketLen, by + mh); ctx.lineTo(bx + mw, by + mh); ctx.lineTo(bx + mw, by + mh - bracketLen); ctx.stroke();

    // Crosshair lines from match center to edges of image
    const cx = bx + mw / 2;
    const cy = by + mh / 2;
    ctx.strokeStyle = "rgba(0, 230, 200, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    // Horizontal line
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(bx, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + mw, cy); ctx.lineTo(resultCanvas.width, cy); ctx.stroke();
    // Vertical line
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, by + mh); ctx.lineTo(cx, resultCanvas.height); ctx.stroke();
    ctx.setLineDash([]);

    // Label with background pill
    const bestLabel = `#1  ${(best.confidence * 100).toFixed(0)}%`;
    ctx.font = "bold 16px sans-serif";
    const bestTW = ctx.measureText(bestLabel).width;
    const labelX = bx;
    const labelY = by - 10;
    ctx.fillStyle = green;
    const pillH = 26, pillW = bestTW + 16, pillR = 6;
    const pillX = labelX, pillY = labelY - pillH + 4;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillText(bestLabel, pillX + 8, pillY + 18);
    ctx.restore();

    // --- Zoomed inset of the matched region ---
    const insetScale = Math.max(3, Math.min(6, 200 / Math.max(mw, mh)));
    const insetW = Math.round(mw * insetScale);
    const insetH = Math.round(mh * insetScale);
    const insetPad = 12;
    const insetX = resultCanvas.width - insetW - insetPad;
    const insetY = insetPad;

    // Inset background
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath();
    ctx.roundRect(insetX - 6, insetY - 6, insetW + 12, insetH + 38, 8);
    ctx.fill();

    // Draw the zoomed piece from the original full image
    // Draw zoomed region from the clean source canvas
    const sx = bx / (resultCanvas.width / fullCanvas.width);
    const sy = by / (resultCanvas.height / fullCanvas.height);
    const sw = mw / (resultCanvas.width / fullCanvas.width);
    const sh = mh / (resultCanvas.height / fullCanvas.height);
    ctx.drawImage(fullCanvas, sx, sy, sw, sh, insetX, insetY, insetW, insetH);

    // Inset border
    ctx.strokeStyle = green;
    ctx.lineWidth = 2;
    ctx.strokeRect(insetX, insetY, insetW, insetH);

    // Inset label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("MATCHED REGION (zoomed)", insetX, insetY + insetH + 18);

    // Connecting line from inset to actual location
    ctx.strokeStyle = "rgba(0, 230, 200, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(insetX, insetY + insetH / 2);
    ctx.lineTo(bx + mw, by + mh / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // --- Result info ---
    const confClass = best.confidence >= 0.7 ? "high" : best.confidence >= 0.4 ? "medium" : "low";
    resultInfo.innerHTML = `
      <div class="info-item">
        <span class="info-label">Confidence</span>
        <span class="info-value ${confClass}">${(best.confidence * 100).toFixed(1)}%</span>
      </div>
      <div class="info-item">
        <span class="info-label">Location</span>
        <span class="info-value">(${best.x}, ${best.y})</span>
      </div>
      <div class="info-item">
        <span class="info-label">Rotation</span>
        <span class="info-value">${bestResult.angle}°</span>
      </div>
      <div class="info-item">
        <span class="info-label">Piece Size</span>
        <span class="info-value">${bestResult.pieceW} × ${bestResult.pieceH}px</span>
      </div>
    `;

    // --- Match table ---
    if (topMatches.length > 1) {
      let rows = topMatches.map((m, i) => `
        <tr>
          <td><span class="rank-badge ${i > 0 ? "secondary" : ""}">${i + 1}</span></td>
          <td>(${m.x}, ${m.y})</td>
          <td>${(m.confidence * 100).toFixed(1)}%</td>
        </tr>
      `).join("");
      matchList.innerHTML = `
        <h3>Top Matches</h3>
        <table>
          <thead><tr><th>Rank</th><th>Location</th><th>Confidence</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } else {
      matchList.innerHTML = "";
    }

    resultsSection.classList.remove("hidden");
    showStatus(`Match found — ${(best.confidence * 100).toFixed(1)}% confidence at (${best.x}, ${best.y})`, "success");
    showProgress(100);

    // Cleanup
    fullMat.delete();
    fullGray.delete();
    pieceMat.delete();
    pieceMask.delete();
    for (const r of allResults) {
      r.resultMat.delete();
    }

    setTimeout(hideProgress, 800);
  } catch (err) {
    console.error(err);
    showStatus("Error: " + err.message, "error");
    hideProgress();
  } finally {
    analyzeBtn.disabled = false;
    updateAnalyzeButton();
  }
});
