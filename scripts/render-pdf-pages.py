from __future__ import annotations

import argparse
from pathlib import Path

import pypdfium2 as pdfium


def render_pdf(pdf_path: Path, out_dir: Path, scale: float = 2.0):
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf = pdfium.PdfDocument(str(pdf_path))
    paths: list[Path] = []
    for index in range(len(pdf)):
        page = pdf[index]
        bitmap = page.render(scale=scale)
        image = bitmap.to_pil()
        out = out_dir / f"page-{index + 1:03d}.png"
        image.save(out)
        paths.append(out)
        page.close()
    pdf.close()
    return paths


def main():
    parser = argparse.ArgumentParser(description="Render a PDF into PNG page images.")
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--scale", type=float, default=2.0)
    args = parser.parse_args()
    paths = render_pdf(args.pdf, args.out_dir, args.scale)
    print(f"rendered {len(paths)} pages to {args.out_dir}")


if __name__ == "__main__":
    main()
