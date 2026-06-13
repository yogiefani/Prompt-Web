"use client";

import { useEffect } from "react";

export function PhantomUIProvider() {
  useEffect(() => {
    // Dynamically import phantom-ui to ensure it only runs on the client
    // since it uses Web Components and the DOM.
    import("@aejkatappaja/phantom-ui").catch((err) => {
      console.error("Failed to load phantom-ui", err);
    });
  }, []);

  return null;
}
