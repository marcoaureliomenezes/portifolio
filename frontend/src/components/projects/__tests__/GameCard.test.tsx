/**
 * GameCard.test.tsx — T-PC-C-02
 *
 * TDD: written before the component exists.
 * Tests:
 *  1. Renders game title
 *  2. Renders engine badge
 *  3. Renders body text
 *  4. Play link has target="_blank" and rel="noopener noreferrer"
 *  5. Renders cover image when cover is set
 *  6. Renders gradient placeholder when cover is empty string
 *  7. GitHub link has correct href and opens in new tab
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GameCard } from "../GameCard";
import type { GameLink } from "@/types/content";

const mockGame: GameLink = {
  slug: "tauan-trex",
  title: "Tauan T-Rex",
  engine: "Phaser.js 3.60",
  cover: "/assets/trex-cover.png",
  body: "A dinosaur runner game built with Phaser.js.",
  repo: "https://github.com/example/tauan-games",
  playUrl: "https://tauan-games.example.com/trex",
};

const mockGameNoCover: GameLink = {
  ...mockGame,
  cover: "",
};

function renderCard(game: GameLink) {
  return render(
    <MemoryRouter>
      <GameCard game={game} />
    </MemoryRouter>
  );
}

describe("GameCard — rendering", () => {
  it("renders game title", () => {
    renderCard(mockGame);
    expect(screen.getByText("Tauan T-Rex")).toBeTruthy();
  });

  it("renders engine badge", () => {
    renderCard(mockGame);
    expect(screen.getByText("Phaser.js 3.60")).toBeTruthy();
  });

  it("renders body text", () => {
    renderCard(mockGame);
    expect(
      screen.getByText("A dinosaur runner game built with Phaser.js.")
    ).toBeTruthy();
  });

  it("play link opens in new tab with noopener noreferrer", () => {
    renderCard(mockGame);
    const playLink = screen.getByRole("link", { name: /play/i });
    expect(playLink.getAttribute("target")).toBe("_blank");
    expect(playLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(playLink.getAttribute("href")).toBe(
      "https://tauan-games.example.com/trex"
    );
  });

  it("renders cover image when cover is set", () => {
    renderCard(mockGame);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("/assets/trex-cover.png");
  });

  it("renders placeholder when cover is empty string", () => {
    const { container } = renderCard(mockGameNoCover);
    const img = container.querySelector("img");
    expect(img).toBeNull();
    const placeholder = container.querySelector(
      "[data-testid='game-cover-placeholder']"
    );
    expect(placeholder).toBeTruthy();
  });

  it("GitHub link has correct href and opens in new tab", () => {
    renderCard(mockGame);
    const githubLink = screen.getByRole("link", { name: /github/i });
    expect(githubLink.getAttribute("href")).toBe(
      "https://github.com/example/tauan-games"
    );
    expect(githubLink.getAttribute("target")).toBe("_blank");
    expect(githubLink.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
