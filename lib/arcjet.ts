import 'server-only'

import arcjet, {
  fixedWindow,
  protectSignup,
  slidingWindow,
  shield,
  sensitiveInfo,
  detectBot,
} from "@arcjet/next";
import { env } from "./env";

export {
  arcjet,
  fixedWindow,
  protectSignup,
  slidingWindow,
  shield,
  sensitiveInfo,
  detectBot,
};

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["fingerprint"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});
