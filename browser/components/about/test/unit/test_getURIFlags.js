const contract = "@mozilla.org/network/protocol/about;1?what=newtab";
const am = Cc[contract].getService(Ci.nsIAboutModule);
const uri = Services.io.newURI("about:newtab");
const privacyCenterContract =
  "@mozilla.org/network/protocol/about;1?what=privacycenter";
const privacyCenterModule = Cc[privacyCenterContract].getService(
  Ci.nsIAboutModule
);
const privacyCenterURI = Services.io.newURI("about:privacycenter");

function run_test() {
  test_AS_enabled_flags();
  test_privacycenter_flags();
}

// Activity Stream, however, is e10s-capable, and should advertise it.
function test_AS_enabled_flags() {
  let flags = am.getURIFlags(uri);

  ok(flags & Ci.nsIAboutModule.URI_MUST_LOAD_IN_CHILD);
}

function test_privacycenter_flags() {
  const flags = privacyCenterModule.getURIFlags(privacyCenterURI);

  ok(
    flags & Ci.nsIAboutModule.URI_MUST_LOAD_IN_CHILD,
    "Privacy Center loads in a content process"
  );
  ok(
    flags & Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT,
    "Privacy Center is marked safe for untrusted content"
  );
  ok(
    flags & Ci.nsIAboutModule.URI_CAN_LOAD_IN_PRIVILEGEDABOUT_PROCESS,
    "Privacy Center can load in the privileged about process"
  );
  ok(
    flags & Ci.nsIAboutModule.ALLOW_SCRIPT,
    "Privacy Center can run its local status script"
  );
  ok(
    flags & Ci.nsIAboutModule.IS_SECURE_CHROME_UI,
    "Privacy Center uses secure chrome UI handling"
  );
}
