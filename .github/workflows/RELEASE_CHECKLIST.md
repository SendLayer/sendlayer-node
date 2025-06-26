 # Release Checklist

Before pushing and publishing a new SDK version, ensure you have completed all of the following steps:

## 1. Versioning
- [ ] Update the version number in the appropriate file:
  - Node: `package.json`
- [ ] Ensure the version follows [Semantic Versioning](https://semver.org/).

## 2. Changelog
- [ ] Update the `CHANGELOG.md` with all new features, bug fixes, and breaking changes.
- [ ] Double-check that all changes since the last release are documented.

## 3. Code Quality
- [ ] Run all tests locally and ensure they pass:
  - Node: `npm test`
- [ ] Lint the codebase and fix any issues:
  - Node: `npm run lint`
- [ ] Review and update documentation as needed (README, docstrings, JSDoc, etc.).

## 4. Dependencies
- [ ] Review and update dependencies if necessary.
- [ ] Ensure there are no security vulnerabilities in dependencies.

## 5. Build
- [ ] Build the package locally to ensure it compiles without errors:
  - Node: `npm run build`

## 6. Test Publishing (Optional but Recommended)
- [ ] Publish to npm test registry (Node, if configured):
  - `npm publish --registry https://registry.npmjs.org` (with a test account or tag)

## 7. Git
- [ ] Commit all changes and push to the main branch.
- [ ] Ensure the latest commit is on `main` and up to date with remote.
- [ ] Tag the release with the version number (the workflow will also do this).

## 8. CI/CD
- [ ] Ensure all GitHub Actions workflows pass (tests, build, publish, etc.).

## 9. Final Publishing
- [ ] Publish to npm (Node):
  - `npm publish`

## 10. Post-Release
- [ ] Verify the package is available on NPM registry.
- [ ] Announce the release (GitHub Release, social media, etc.).
- [ ] Monitor for any issues reported by users.

---

**Tip:** Consider automating as much of this checklist as possible with scripts and CI/CD workflows.
