import { escapeHtml } from "../lib/text.js";

// Shared HTML shell for every transactional email. Inline styles only (email clients ignore stylesheets).
const color = { black: "#171513", charcoal: "#24211E", ivory: "#F4EFE6", sand: "#D8CDBD", copper: "#B85C32", terracotta: "#7C3825" };

export function emailButton(href, label) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${color.terracotta};color:${color.ivory};text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:8px;">${escapeHtml(label)}</a>`;
}

export function renderEmailLayout({ restaurantName, tagline, preheader, bodyHtml }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(restaurantName)}</title></head>
<body style="margin:0;padding:0;background:${color.black};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${color.black};padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr><td style="padding:0 0 24px;text-align:center;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:${color.ivory};">${escapeHtml(restaurantName)}</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:${color.copper};margin-top:4px;">${escapeHtml(tagline)}</div>
    </td></tr>
    <tr><td style="background:${color.charcoal};border-radius:12px;padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${color.sand};">
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:20px 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${color.sand};">&copy; ${escapeHtml(restaurantName)}</td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

export const emailColors = color;
