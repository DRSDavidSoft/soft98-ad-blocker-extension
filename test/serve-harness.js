#!/usr/bin/env node
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 8798);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};
const DEFAULT_LIVE_URL = "https://soft98.ir/internet/download-manager/4-idm-full-dl.html";

function safeJoin(base, requestPath) {
  const url = new URL(requestPath, "http://127.0.0.1");
  const relative = url.pathname === "/" ? "test/soft98-ad-blocker-harness.html" : url.pathname.slice(1);
  const resolved = path.resolve(base, relative);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) throw new Error("Unsafe path");
  return resolved;
}

http
  .createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url, "http://127.0.0.1");
      if (requestUrl.pathname === "/live") {
        const target = requestUrl.searchParams.get("url") || DEFAULT_LIVE_URL;
        const proofView = requestUrl.searchParams.get("view") || "";
        const upstream = await fetch(target, {
          headers: {
            "user-agent": "Mozilla/5.0 Soft98AdBlockerProof",
          },
        });
        if (!upstream.ok) throw new Error(`Soft98 returned ${upstream.status}`);
        const original = await upstream.text();
        const proofScript = `<script src="http://127.0.0.1:${PORT}/soft98-pro.user.js"></script><script>
            (function () {
              var proofView = ${JSON.stringify(proofView)};
              function ready(callback) {
                if (document.body) callback();
                else document.addEventListener("DOMContentLoaded", callback, { once: true });
              }
              function findDownloadSection() {
                var nodes = Array.prototype.slice.call(document.querySelectorAll("section,article,div,ul,table,a,button"));
                var candidates = nodes.filter(function (node) {
                  var text = (node.textContent || "").replace(/\\s+/g, " ");
                  var attrs = [node.id, node.className, node.getAttribute && node.getAttribute("href")].join(" ");
                  return /لینک\\s*(?:های)?\\s*دانلود|دانلود\\s*(?:بخش|نسخه|فایل)|download\\s*(?:link|file)|hcrack/i.test(text + " " + attrs);
                }).filter(function (node) {
                  var box = node.getBoundingClientRect();
                  return box.width > 0 && box.height > 0;
                });
                candidates.sort(function (left, right) {
                  return left.getBoundingClientRect().top - right.getBoundingClientRect().top;
                });
                return candidates.find(function (node) { return node.getBoundingClientRect().top > 600; }) || candidates[candidates.length - 1] || null;
              }
              ready(function () {
              setTimeout(function () {
                var links = Array.prototype.slice.call(document.querySelectorAll("a[href], button, [data-url], [data-href], [onclick]")).filter(function (node) {
                  var text = (node.textContent || node.title || node.getAttribute("aria-label") || "").replace(/\\s+/g, " ");
                  var href = node.href || node.getAttribute("data-href") || node.getAttribute("data-url") || "";
                  var click = node.getAttribute("onclick") || "";
                  return /دانلود|Download|hcrack|download/i.test(text + " " + href + " " + click);
                });
                var visible = function (node) {
                  var box = node.getBoundingClientRect();
                  var style = getComputedStyle(node);
                  return box.width > 0 && box.height > 0 && style.display !== "none" && style.visibility !== "hidden";
                };
                var adSize = /^(728x90|970x90|468x60|300x250|336x280|240x90|160x600)$/;
                var isAd = function (node) {
                  var img = node.tagName === "IMG" ? node : node.querySelector && node.querySelector("img");
                  var hrefNode = node.closest && node.closest("a[href]");
                  var href = hrefNode ? hrefNode.href : node.href || "";
                  var src = img ? img.currentSrc || img.src || "" : node.src || "";
                  if (/kaprila|buysellads/i.test(src + " " + href + " " + node.id + " " + node.className)) return true;
                  if (!img) return false;
                  var box = img.getBoundingClientRect();
                  var size = Math.round(box.width) + "x" + Math.round(box.height);
                  return adSize.test(size) && (/img\\.soft98\\.ir\\/(ads?|[0-9]+)\\//i.test(src) || /utm_|banner|kaprila|ad/i.test(href));
                };
                var ads = Array.prototype.slice.call(document.querySelectorAll("a[href], img, iframe, [id*=kaprila], [class*=kaprila], [class*=buysellads]")).filter(function (node) {
                  return visible(node) && isAd(node);
                }).length;
                var warnings = Array.prototype.slice.call(document.querySelectorAll(".tbd_ibd, .trk_irk, .tbdc, body *")).filter(function (node) {
                  if (!visible(node)) return false;
                  return /افزونه\\s+حذف|ﺗﺒﻠﻴﻐﺎت|Dark Reader|SMostafaMoosavi|VPN را غیرفعال/.test(node.textContent || "");
                }).length;
                var first = links.find(function (link) { return link.href && !/^#|javascript:/i.test(link.getAttribute("href") || ""); });
                if (proofView === "download") {
                  var target = findDownloadSection();
                  if (target) target.scrollIntoView({ block: "center", inline: "nearest" });
                }
                var overlay = document.createElement("div");
                overlay.id = "soft98-proof-overlay";
                overlay.dir = "ltr";
                overlay.style.cssText = "position:fixed;z-index:2147483647;left:16px;bottom:16px;display:grid;gap:6px;max-width:560px;padding:12px 14px;border:1px solid #245a38;border-radius:8px;background:#08140d;color:#dbffe5;font:13px/1.45 ui-monospace,Consolas,monospace;box-shadow:0 10px 35px rgba(0,0,0,.35)";
                overlay.innerHTML = "<strong>Soft98 Pro live proof</strong><span>ads: " + ads + "</span><span>warnings: " + warnings + "</span><span>download links: " + links.length + "</span><span>first href: " + (first ? first.href : "none") + "</span>";
                (document.body || document.documentElement).appendChild(overlay);
              }, 1800);
            });
            })();
          </script>`;
        const withBase = original.replace(/<head([^>]*)>/i, `<head$1><base href="${target}">`);
        const injected = /<\/body>/i.test(withBase) ? withBase.replace(/<\/body>/i, `${proofScript}</body>`) : `${withBase}${proofScript}`;
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(injected);
        return;
      }
      const filePath = safeJoin(ROOT, request.url);
      const body = fs.readFileSync(filePath);
      response.writeHead(200, { "content-type": TYPES[path.extname(filePath)] || "application/octet-stream" });
      response.end(body);
    } catch (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 400, { "content-type": "text/plain; charset=utf-8" });
      response.end(error.message);
    }
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Soft98 harness server listening on http://127.0.0.1:${PORT}`);
  });
