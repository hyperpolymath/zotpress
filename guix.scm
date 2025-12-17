;; SPDX-License-Identifier: AGPL-3.0-or-later
;; SPDX-FileCopyrightText: 2025 Jonathan D.A. Jewell
;; guix.scm — zotpress package definition
;;
;; Run: guix shell -D -f guix.scm
;; Build: guix build -f guix.scm

(use-modules (guix packages)
             (guix gexp)
             (guix git-download)
             (guix build-system copy)
             ((guix licenses) #:prefix license:)
             (gnu packages php)
             (gnu packages version-control))

(define-public zotpress
  (package
    (name "zotpress")
    (version "1.0.0")
    (source (local-file "." "zotpress-checkout"
                        #:recursive? #t
                        #:select? (git-predicate ".")))
    (build-system copy-build-system)
    (arguments
     '(#:install-plan
       '(("lib" "share/wordpress/plugins/zotpress/lib")
         ("css" "share/wordpress/plugins/zotpress/css")
         ("languages" "share/wordpress/plugins/zotpress/languages"))
       #:phases
       (modify-phases %standard-phases
         (add-after 'install 'create-plugin-file
           (lambda* (#:key outputs #:allow-other-keys)
             (let ((out (assoc-ref outputs "out"))
                   (plugin-dir "share/wordpress/plugins/zotpress"))
               ;; Plugin structure ready for WordPress
               #t))))))
    (native-inputs
     (list git))
    (synopsis "Zotero bibliography integration for WordPress")
    (description
     "Zotpress is a WordPress plugin that integrates with Zotero to display
bibliographies, citations, and references on WordPress sites.  It supports
shortcodes for embedding Zotero collections and items directly in posts and
pages.  Part of the RSR (Rhodium Standard Repository) ecosystem.")
    (home-page "https://github.com/hyperpolymath/zotpress")
    (license license:agpl3+)))

;; Return package for guix shell
zotpress
