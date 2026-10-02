import { NextResponse } from "next/server";

// Served as a Route Handler (not a static public/ file) so it's produced
// by the app server rather than the static-asset layer — some hosts/CDNs
// apply a default security rule that hides any path starting with a dot
// (to keep .git, .env, etc. unreachable) and catch the one dot-path that's
// actually supposed to be public, /.well-known/*, in the same net. Static
// hosting hit that here (this path 404'd even though the file was
// correctly deployed); going through the app server sidesteps it in most
// setups, since that rule usually applies to the static-file/CDN layer.
//
// Content must stay byte-identical to what public/.well-known/assetlinks.json
// held: package_name + the release keystore's SHA-256 fingerprint (see
// twa/README.md). Regenerate this if the signing key ever changes.
const ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.qareeb.twa",
      sha256_cert_fingerprints: [
        "71:1E:16:A3:D5:F8:A1:35:5F:A8:E8:5A:1C:16:84:09:C4:A2:E1:22:A2:EA:F7:17:42:72:53:A1:34:EA:A9:A4",
        "A1:FC:12:4A:7A:13:4A:6A:87:E2:ED:A3:F1:C9:57:F6:EC:C8:84:21:B9:4D:7A:F1:59:0A:61:12:8E:D5:CC:30",
      ],
    },
  },
];

export function GET() {
  return NextResponse.json(ASSET_LINKS);
}
