"use client";

import React from "react";

export function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Вольница"
      src="/images/brand/logo-volnitsa-runa-transparent.png"
      style={{
        display: "block",
        height: "auto",
        maxHeight: 72,
        maxWidth: 220,
        objectFit: "contain",
        width: "100%",
      }}
    />
  );
}
