# Third-party software

HEIC fallback decoding uses the unmodified CSP distribution of [heic-to 1.6.7](https://github.com/hoppergee/heic-to/tree/v1.6.7), by Hopper Gee, under LGPL-3.0-or-later. It includes libheif and its codec components; their notices are retained in the upstream source distribution.

The build distributes the decoder as a separate, replaceable JavaScript module at `vendor/heic-to.js`, its license at `vendor/heic-to.LICENSE.txt`, and its supplied source at `vendor/heic-to-source/`. Full upstream source and build instructions are available from the linked version and the pinned package `https://registry.npmjs.org/heic-to/-/heic-to-1.6.7.tgz`. No decoder modifications are made by this application. Users may replace the module with a compatible version.

The application loads no third-party hosted assets at runtime. Official requirements links open only when a user chooses them.
