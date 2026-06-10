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
  <title>XML Sitemap — 餐飲SaaS出海指南</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans TC", "PingFang TC", sans-serif;
      background: #f5f5f7;
      color: #1d1d1f;
      line-height: 1.6;
      padding: 2.5rem 1.5rem 4rem;
    }
    .container { max-width: 960px; margin: 0 auto; }
    header {
      text-align: center;
      padding-bottom: 2rem;
      border-bottom: 1px solid #d2d2d7;
      margin-bottom: 2rem;
    }
    header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
    }
    header .domain {
      font-size: 0.95rem;
      color: #0066cc;
    }
    header .domain a {
      color: inherit;
      text-decoration: none;
    }
    header .domain a:hover { text-decoration: underline; }
    .stats {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem 2.5rem;
      margin-top: 1.1rem;
      font-size: 0.875rem;
      color: #86868b;
    }
    .stats span strong { color: #1d1d1f; font-weight: 600; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    thead { background: #1d1d1f; color: #f5f5f7; }
    th {
      padding: 0.8rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: left;
      white-space: nowrap;
    }
    td {
      padding: 0.7rem 1rem;
      font-size: 0.875rem;
      border-bottom: 1px solid #f0f0f1;
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9f9fc; }
    td.loc a {
      color: #0066cc;
      text-decoration: none;
      word-break: break-all;
      font-size: 0.85rem;
    }
    td.loc a:hover { text-decoration: underline; }
    td.loc .path-only { color: #86868b; font-family: "SF Mono", Monaco, "Cascadia Code", monospace; font-size: 0.8rem; }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 5px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .badge-daily    { background: #e3f2fd; color: #1565c0; }
    .badge-weekly   { background: #e8f5e9; color: #2e7d32; }
    .badge-monthly  { background: #fff3e0; color: #e65100; }
    .badge-lang {
      font-size: 0.68rem;
      margin-left: 0.45rem;
      vertical-align: middle;
    }
    .badge-zh { background: #e8eaf6; color: #283593; }
    .badge-en { background: #fce4ec; color: #880e4f; }
    .prio {
      font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
      font-size: 0.78rem;
      color: #86868b;
      text-align: center;
      display: block;
    }
    .date-cell { white-space: nowrap; font-size: 0.82rem; color: #6e6e73; }
    footer {
      text-align: center;
      margin-top: 2.5rem;
      font-size: 0.78rem;
      color: #aeaeb2;
    }
    footer p + p { margin-top: 0.25rem; }
    @media (max-width: 640px) {
      body { padding: 1.2rem 0.6rem 3rem; }
      th:nth-child(4), td:nth-child(4),
      th:nth-child(3), td:nth-child(3) { display: none; }
      td.loc a { font-size: 0.8rem; }
      .stats { gap: 0.8rem 1.5rem; font-size: 0.8rem; }
    }
  </style>
</head>
<body>
<div class="container">
  <header>
    <h1>餐飲SaaS出海指南 · XML Sitemap</h1>
    <div class="domain"><a href="https://blog.foolcar.cc/">blog.foolcar.cc</a></div>
    <div class="stats">
      <span>收錄網址：<strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></span>
      <span>中文文章：<strong><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/blog/') and not(contains(sitemap:loc,'/en/'))]) - count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/category/') or contains(sitemap:loc,'/tags/')])"/></strong></span>
      <span>英文文章：<strong><xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc,'/en/blog/')])"/></strong></span>
      <span>更新日期：<strong><xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:lastmod"/></strong></span>
    </div>
  </header>

  <table>
    <thead>
      <tr>
        <th style="width:54%">頁面路徑</th>
        <th style="width:15%">最後更新</th>
        <th style="width:11%">更新頻率</th>
        <th style="width:8%">權重</th>
      </tr>
    </thead>
    <tbody>
      <xsl:for-each select="sitemap:urlset/sitemap:url">
      <xsl:sort select="sitemap:priority" order="descending" data-type="number"/>
      <xsl:variable name="loc" select="sitemap:loc"/>
      <xsl:variable name="path" select="concat('/', substring-after(substring-after($loc, '//'), '/'))"/>
      <xsl:variable name="displayPath">
        <xsl:choose>
          <xsl:when test="$path='/'">/ （首頁）</xsl:when>
          <xsl:when test="$path='/en/'">/en/ （英文首頁）</xsl:when>
          <xsl:when test="$path='/about/'">/about/</xsl:when>
          <xsl:when test="$path='/en/about/'">/en/about/</xsl:when>
          <xsl:when test="$path='/blog/'">/blog/</xsl:when>
          <xsl:when test="$path='/en/blog/'">/en/blog/</xsl:when>
          <xsl:when test="starts-with($path, '/blog/')">
            <xsl:value-of select="concat('/', substring-after($path, '/blog/'))"/>
          </xsl:when>
          <xsl:when test="starts-with($path, '/en/blog/')">
            <xsl:value-of select="concat('/en/', substring-after($path, '/en/blog/'))"/>
          </xsl:when>
          <xsl:when test="starts-with($path, '/category/')">
            <xsl:value-of select="$path"/>
          </xsl:when>
          <xsl:when test="starts-with($path, '/tags/')">
            <xsl:value-of select="$path"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$path"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>
      <tr>
        <td class="loc">
          <a href="{$loc}"><xsl:value-of select="$displayPath"/></a>
          <xsl:choose>
            <xsl:when test="contains($loc, '/en/') and not(contains($loc, '/en/blog/'))"><span class="badge badge-en badge-lang">EN</span></xsl:when>
            <xsl:when test="contains($loc, '/en/blog/')"><span class="badge badge-en badge-lang">EN</span></xsl:when>
          </xsl:choose>
          <xsl:if test="contains($loc, '/blog/') and not(contains($loc, '/en/')) and not(contains(substring-after($loc, 'blog.foolcar.cc'), 'blog'))"> <span class="badge badge-zh badge-lang">中文</span></xsl:if>
        </td>
        <td class="date-cell"><xsl:value-of select="sitemap:lastmod"/></td>
        <td>
          <xsl:choose>
            <xsl:when test="sitemap:changefreq = 'daily'"><span class="badge badge-daily">每日</span></xsl:when>
            <xsl:when test="sitemap:changefreq = 'weekly'"><span class="badge badge-weekly">每週</span></xsl:when>
            <xsl:when test="sitemap:changefreq = 'monthly'"><span class="badge badge-monthly">每月</span></xsl:when>
            <xsl:otherwise><span style="color:#aaa">—</span></xsl:otherwise>
          </xsl:choose>
        </td>
        <td><span class="prio"><xsl:value-of select="sitemap:priority"/></span></td>
      </tr>
      </xsl:for-each>
    </tbody>
  </table>

  <footer>
    <p>本頁為 XML Sitemap 的視覺化呈現，供人工瀏覽使用</p>
    <p>搜尋引擎會直接讀取原始 XML 格式進行索引</p>
  </footer>
</div>
</body>
</html>
</xsl:template>
</xsl:stylesheet>