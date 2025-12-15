;; SPDX-License-Identifier: AGPL-3.0-or-later
;; SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell
;; ECOSYSTEM.scm — zotpress

(ecosystem
  (version "1.0.0")
  (name "zotpress")
  (type "project")
  (purpose "WordPress plugin for Zotero integration")

  (position-in-ecosystem
    "Part of hyperpolymath ecosystem. Follows RSR guidelines.")

  (related-projects
    (project (name "rhodium-standard-repositories")
             (url "https://github.com/hyperpolymath/rhodium-standard-repositories")
             (relationship "standard")))

  (what-this-is "WordPress plugin for displaying Zotero bibliographies")
  (what-this-is-not "- NOT exempt from RSR compliance"))
