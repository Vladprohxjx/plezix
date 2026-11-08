const contract = "@mozilla.org/network/protocol/about;1?what=newtab";
const am = Cc[contract].getService(Ci.nsIAboutModule);
const uri = Services.io.newURI("about:newtab");

function run_test() {
  test_AS_enabled_flags();
  test_privacy_dashboard_flags();
}

// Activity Stream, however, is e10s-capable, and should advertise it.
function test_AS_enabled_flags() {
  let flags = am.getURIFlags(uri);

  ok(flags & Ci.nsIAboutModule.URI_MUST_LOAD_IN_CHILD);
}


function test_privacy_dashboard_flags() {
  const contract =
    "@mozilla.org/network/protocol/about;1?what=privacy";
  const about = Cc[contract].getService(Ci.nsIAboutModule);
  const uri = Services.io.newURI("about:privacy");
  const flags = about.getURIFlags(uri);

  ok(
    flags & Ci.nsIAboutModule.URI_MUST_LOAD_IN_CHILD,
    "Privacy Dashboard loads in a content process"
  );
  ok(
    flags & Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT,
    "Privacy Dashboard is safe for untrusted content"
  );
  ok(
    flags & Ci.nsIAboutModule.URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS,
    "Privacy Dashboard can load in the privileged about process"
  );
  ok(
    flags & Ci.nsIAboutModule.ALLOW_SCRIPT,
    "Privacy Dashboard can run its local status script"
  );
  ok(
    flags & Ci.nsIAboutModule.IS_SECURE_CHROME_UI,
    "Privacy Dashboard uses secure chrome UI handling"
  );
}
