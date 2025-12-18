;;; STATE.scm --- zotpress conversation checkpoint
;;; SPDX-License-Identifier: AGPL-3.0-or-later
;;; Format: Guile Scheme S-expressions
;;; Schema: RSR STATE v2.0

(define state
  `((metadata
     (format-version . "2.0")
     (schema-version . "2025-12-18")
     (project . "zotpress")
     (created . "2025-12-10T19:03:55+00:00")
     (updated . "2025-12-18T00:00:00+00:00"))

    (position
     (summary . "RSR-compliant WordPress plugin for Zotero integration")
     (phase . implementation)
     (maturity . beta)
     (rsr-tier . gold)
     (primary-language . "php")
     (secondary-languages . ("rescript"))
     (build-tooling . "deno")
     (domain . "WordPress/Zotero"))

    (context
     (last-session . "2025-12-18")
     (focus-area . "ReScript migration and RSR enforcement")
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
      (notes . "Proper build phases and description"))
     ((name . "ReScript migration")
      (status . complete)
      (files . ("src/rescript/Zotpress.res" "src/rescript/Utils.res"))
      (notes . "Frontend migrated from TypeScript to ReScript"))
     ((name . "RSR enforcement")
      (status . complete)
      (files . (".github/workflows/rsr-antipattern.yml"))
      (notes . "TypeScript blocked in src/, Deno scripts allowed")))

    (issues
     (active . ())
     (resolved
      . (((issue . "Actions not SHA-pinned")
          (resolution . "Updated all workflow files"))
         ((issue . "TypeScript in src/")
          (resolution . "Migrated to ReScript, removed zotpress.ts"))))
     (known-limitations . ())
     (technical-debt . ()))

    (language-policy
     (allowed
      . (("php" . "WordPress plugin code")
         ("rescript" . "Frontend code in src/rescript/")
         ("deno-typescript" . "Build scripts in scripts/ only")
         ("python-saltstack" . "SaltStack modules only")
         ("python-robot-repo-bot" . "Offline maintenance bot")))
     (blocked
      . (("typescript-src" . "Use ReScript instead")
         ("go" . "Use Rust/WASM instead")
         ("npm" . "Use Deno instead")
         ("python-general" . "Only Salt/robot-repo-bot allowed"))))

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
           "SHA-pinned CI/CD"
           "ReScript frontend")))
      ((version . "1.1.0")
       (status . planned)
       (features
        . ("Improved caching"
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
        . ("Zotero API v4 support"
           "Real-time sync"
           "Offline mode")))))

    (ecosystem
     (part-of . ("RSR Framework" "hyperpolymath ecosystem"))
     (depends-on . ("WordPress" "Zotero API"))
     (integrates-with . ("Gutenberg" "Classic Editor"))
     (supersedes . ()))

    (security
     (compliance . ("RSR Gold" "OWASP Top 10"))
     (scanning . ("CodeQL" "TruffleHog" "PHPStan" "Dependabot"))
     (actions-pinned . #t)
     (language-enforcement . #t))

    (session-files
     (".github/workflows/rsr-antipattern.yml"
      ".github/workflows/codeql-analysis.yml"
      "src/js/zotpress.ts (REMOVED)"
      "scripts/build-js.ts"
      "deno.json"
      "STATE.scm"))

    (notes
     "ReScript migration completed 2025-12-18. TypeScript removed from src/.
      Deno build scripts remain in scripts/ directory (allowed per RSR policy).
      RSR anti-pattern workflow updated to enforce language policy.
      Python exception added for robot-repo-bot offline maintenance bot.")))

state
