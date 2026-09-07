"use client";

import React from "react";
import { HomeLayoutPanel } from "./HomeLayoutPanel";

/** Экран /admin/home — тексты героя главной и галереи. */
export function HomeLayoutView() {
  return (
    <div className="gutter" style={{ padding: "1.5rem 2rem 2.5rem" }}>
      <HomeLayoutPanel />
    </div>
  );
}
