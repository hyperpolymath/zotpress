# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Zotpress, please report it responsibly:

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Email: hyperpolymath@proton.me
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity
  - Critical: Within 7 days
  - High: Within 30 days
  - Medium/Low: Next release cycle

## Security Measures

This project follows the [Rhodium Standard Repository (RSR)](https://github.com/hyperpolymath/rhodium-standard-repositories) security guidelines:

### Supply Chain Security
- All GitHub Actions use SHA-pinned versions
- Dependencies monitored via Dependabot
- OSSF Scorecard integration
- CodeQL analysis on every push

### Code Security
- PHPStan static analysis (Level 9)
- WordPress coding standards (WPCS)
- PHP 8.1+ with strict types
- No eval(), exec(), or shell_exec() in production code
- Prepared statements for all database queries

### Cryptographic Standards
- No MD5/SHA1 for security purposes
- SHA256+ required for all security operations
- HTTPS-only URLs

### Secrets Management
- No hardcoded secrets
- Environment variables for all credentials
- .env files excluded from version control

## Security Tools

The following security checks run automatically:

- **CodeQL**: SAST scanning for vulnerabilities
- **TruffleHog**: Secret detection
- **PHPStan**: Static type analysis
- **PHPCS**: WordPress security patterns
- **Dependabot**: Dependency vulnerabilities
- **OSSF Scorecard**: Supply chain best practices

## Disclosure Policy

We follow responsible disclosure:

1. Reporter contacts us privately
2. We confirm receipt within 48 hours
3. We investigate and validate
4. We develop and test a fix
5. We release the fix
6. We publicly acknowledge the reporter (if desired)
7. We publish a security advisory

## References

- [RSR Security Guidelines](https://github.com/hyperpolymath/rhodium-standard-repositories)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WordPress Security Best Practices](https://developer.wordpress.org/plugins/security/)
