"""Loop-27 preprocessing engine — extracted verbatim from Untitled3.ipynb.

Decouples raw lighting/shadow layouts from physical topography shapes via a
dual-path fusion: (A) Sobel phase-angle cosine invariant map, (B) unsharp-mask
micro-texture, fused 0.8/0.2 with CLAHE contrast tuning.
"""

import cv2
import numpy as np


def run_loop_27_preprocessing(src_img: np.ndarray) -> np.ndarray:
    clipped = np.clip(src_img, 20, 235)
    norm = cv2.normalize(clipped, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_32F)

    # Path A: Invariant Cosine Radiant Phase Angle Continuum
    gx = cv2.Sobel(norm, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(norm, cv2.CV_32F, 0, 1, ksize=3)
    phase_rad = cv2.phase(gx, gy, angleInDegrees=False)
    phase_invariant_map = cv2.normalize(
        np.cos(phase_rad), None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U
    )

    # Path B: Micro-Texture High-Pass Unsharp Masking
    norm_u8 = cv2.normalize(clipped, None, 0, 255, cv2.NORM_MINMAX, dtype=cv2.CV_8U)
    blur = cv2.GaussianBlur(norm_u8, (9, 9), 2.0)
    sharp = cv2.addWeighted(norm_u8, 1.5, blur, -0.5, 0)

    # Dual-Path Continuum Fusion + CLAHE 8x8
    fused_space = cv2.addWeighted(sharp, 0.8, phase_invariant_map, 0.2, 0)
    clahe_engine = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe_engine.apply(fused_space)
