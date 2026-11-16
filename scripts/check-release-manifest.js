/**
 * Laya Mobile — Release Manifest Integrity Check
 * Prevents race conditions by ensuring version.json is not manually bumped ahead of EAS builds
 */
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'version.json'), 'utf8'));

// Verify manifest structure
if (!manifest.latestVersion || !manifest.apkUrl || !Array.isArray(manifest.releaseNotes)) {
  console.error('❌ [MANIFEST INVALID] version.json must contain latestVersion, apkUrl, and releaseNotes array.');
  process.exit(1);
}

// Ensure latestVersion is never ahead of package.json version
const parse = (v) => v.split('.').map((p) => parseInt(p, 10) || 0);
const [mMajor, mMinor, mPatch] = parse(manifest.latestVersion);
const [pMajor, pMinor, pPatch] = parse(pkg.version);

const isManifestAhead =
  mMajor > pMajor ||
  (mMajor === pMajor && mMinor > pMinor) ||
  (mMajor === pMajor && mMinor === pMinor && mPatch > pPatch);

if (isManifestAhead) {
  console.error(`❌ [RACE CONDITION GUARD] version.json (${manifest.latestVersion}) is ahead of package.json (${pkg.version})!`);
  console.error('   version.json should only be bumped by the automated publish action after the APK builds.');
  process.exit(1);
}

console.log(`✅ [MANIFEST INTEGRITY PASSED] package.json (${pkg.version}) >= version.json (${manifest.latestVersion}).`);
