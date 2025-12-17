;;; STATE.scm --- zotpress conversation checkpoint
;;; SPDX-License-Identifier: AGPL-3.0-or-later
;;; Format: Guile Scheme S-expressions
;;; Schema: RSR STATE v2.0

(define state
  `((metadata
     (format-version . "2.0")
     (schema-version . "2025-12-17")
     (project . "zotpress")
     (created . "2025-12-10T19:03:55+00:00")
     (updated . "2025-12-17T00:00:00+00:00"))

    (position
     (summary . "RSR-compliant WordPress plugin for Zotero integration")
     (phase . implementation)
     (maturity . beta)
     (rsr-tier . gold)
     (primary-language . "php")
     (secondary-languages . ("rescript" "typescript"))
     (domain . "WordPress/Zotero"))

    (context
     (last-session . "2025-12-17")
     (focus-area . "Security hardening and RSR compliance")
     (blockers . ())
     (decisions-pending . ()))

    (implementations
     ((name . "SHA-pinned GitHub Actions")
      (status . complete)
      (files . (".github/workflows/*.yml"))
      (notes . "All actions now use SHA-pinned versions"))
     ((name . "Security policy")
      (status . complete)
      (files . ("SECURITY.md"))
      (notes . "Project-specific security documentation"))
     ((name . "Guix package definition")
      (status . complete)
      (files . ("guix.scm"))
      (notes . "Proper build phases and description")))

    (issues
     (active . ())
     (resolved
      . ((issue . "Actions not SHA-pinned")
         (resolution . "Updated all workflow files")))
     (known-limitations
      . ("TypeScript in src/ for legacy compatibility"))
     (technical-debt
      . ("ReScript migration incomplete")))

    (roadmap
     (current-version . "1.0.0")
     (next-milestone . "1.1.0")
     (version-plan
      ((version . "1.0.0")
       (status . current)
       (features
        . ("Core bibliography display"
           "Shortcode support"
           "Widget integration"
           "RSR Gold compliance"
           "SHA-pinned CI/CD")))
      ((version . "1.1.0")
       (status . planned)
       (features
        . ("ReScript migration for frontend"
           "Improved caching"
           "Block editor support"
           "Accessibility improvements")))
      ((version . "1.2.0")
       (status . planned)
       (features
        . ("REST API endpoints"
           "Citation export formats"
           "Multi-site support")))
      ((version . "2.0.0")
       (status . future)
       (features
        . ("Full ReScript rewrite"
           "Zotero API v4 support"
           "Real-time sync")))))

    (ecosystem
     (part-of . ("RSR Framework" "hyperpolymath ecosystem"))
     (depends-on . ("WordPress" "Zotero API"))
     (integrates-with . ("Gutenberg" "Classic Editor"))
     (supersedes . ()))

    (security
     (compliance . ("RSR Gold" "OWASP Top 10"))
     (scanning . ("CodeQL" "TruffleHog" "PHPStan" "Dependabot"))
     (actions-pinned . #t))

    (session-files
     (".github/workflows/*.yml"
      "SECURITY.md"
      "guix.scm"
      "STATE.scm"
      ".github/dependabot.yml"))

    (notes
     "Security review completed 2025-12-17. All GitHub Actions now SHA-pinned.
      SECURITY.md updated with project-specific content. Guix package definition
      improved with proper build phases and description. Ready for 1.0.0 release.")))

state
