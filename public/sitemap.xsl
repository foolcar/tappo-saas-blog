<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap xhtml">

<xsl:output method="html" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Site Map — Tappo SaaS Blog</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans TC", sans-serif;
      background: #f5f5f7;
      color: #1d1d1f;
      line-height: 1.6;
      padding: 2rem 1.5rem;
    }
    .container { max-width: 920px; margin: 0 auto; }
    header {
      text-align: center;
      padding-bottom: 2rem;
      border-bottom: 1px solid #d2d2d7;
      margin-bottom: 2rem;
    }
    header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    header a {
      font-size: 0.95rem;
      color: #0066cc;
      text-decoration: none;
    }
    header a:hover { text-decoration: underline; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #86868b;
    }
    .stats span strong { color: #1d1d1f; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    thead { background: #1d1d1f; color: #f5f5f7; }
    th {
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: left;
    }
    td {
      padding: 0.65rem 1rem;
      font-size: 0.875rem;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9f9fb; }
    td.loc a {
      color: #0066cc;
      text-decoration: none;
      word-break: break-all;
    }
    td.loc a:hover { text-decoration: underline; }
    .badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-daily    { background: #e3f2fd; color: #1565c0; }
    .badge-weekly   { background: #e8f5e9; color: #2e7d32; }
    .badge-monthly  { background: #fff3e0; color: #e65100; }
    .badge-en       { background: #f3e5f5; color: #7b1fa2; font-size: 0.7rem; margin-left: 0.4rem; vertical-align: middle; }
    .prio { font-family: "SF Mono", Monaco, "Cascadia Code", monospace; font-size: 0.8rem; color: #86868b; }
    footer {
      text-align: center;
      margin-top: 2rem;
      font-size: 0.8rem;
      color: #86868b;
    }
    @media (max-width: 600px) {
      body { padding: 1rem 0.75rem; }
      th:nth-child(4), td:nth-child(4) { display: none; }
      th:nth-child(3), td:nth-child(3) { display: none; }
      .stats { flex-wrap: wrap; gap: 1rem; }
    }
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1>Tappo SaaS Blog · Site Map</h1>
    <a href="https://foolcar.github.io/tappo-saas-blog/">foolcar.github.io/tappo-saas-blog</a>
    <div class="stats">
      <span>Total URLs: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></span>
      <span>Last updated: <strong><xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:lastmod"/></strong></span>
    </div>
  </header>

  <table>
    <thead>
      <tr>
        <th style="width:58%">URL</th>
        <th style="width:15%">Last Modified</th>
        <th style="width:12%">Change Freq</th>
        <th style="width:8%">Priority</th>
      </tr>
    </thead>
    <tbody>
      <xsl:for-each select="sitemap:urlset/sitemap:url">
      <xsl:sort select="sitemap:priority" order="descending" data-type="number"/>
      <xsl:variable name="loc" select="sitemap:loc"/>
      <xsl:variable name="path" select="substring-after($loc, 'tappo-saas-blog')"/>
      <tr>
        <td class="loc">
          <a href="{$loc}">
            <xsl:choose>
              <xsl:when test="$path = ''">/</xsl:when>
              <xsl:otherwise><xsl:value-of select="$path"/></xsl:otherwise>
            </xsl:choose>
          </a>
          <xsl:if test="contains($loc, '/en/')"><span class="badge badge-en">EN</span></xsl:if>
        </td>
        <td><xsl:value-of select="sitemap:lastmod"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="sitemap:changefreq = 'daily'"><span class="badge badge-daily">Daily</span></xsl:when>
            <xsl:when test="sitemap:changefreq = 'weekly'"><span class="badge badge-weekly">Weekly</span></xsl:when>
            <xsl:when test="sitemap:changefreq = 'monthly'"><span class="badge badge-monthly">Monthly</span></xsl:when>
            <xsl:otherwise>—</xsl:otherwise>
          </xsl:choose>
        </td>
        <td><span class="prio"><xsl:value-of select="sitemap:priority"/></span></td>
      </tr>
      </xsl:for-each>
    </tbody>
  </table>

  <footer>
    <p>XML Sitemap — Generated for search engines</p>
  </footer>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
