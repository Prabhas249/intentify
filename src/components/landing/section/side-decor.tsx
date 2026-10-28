/**
 * Linear-style page-gutter decoration.
 * Renders a fixed dot-grid behind everything (visible only in the side margins,
 * since the centered content column sits on a solid background above it) plus
 * two faint glowing vertical rails aligned to the container edges.
 */
export function SideDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden lg:block"
    >
      {/* Dot grid across the viewport, faded top + bottom so it never looks harsh */}
      <div
        className="absolute inset-0 [background-size:18px_18px] [background-image:radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]"
      />

      {/* Two vertical accent rails at the edges of the 7xl content column */}
      <div className="absolute inset-y-0 left-1/2 w-full max-w-7xl -translate-x-1/2">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        {/* Soft glow hugging each rail */}
        <div className="absolute inset-y-0 -left-px w-16 bg-gradient-to-r from-primary/[0.06] to-transparent" />
        <div className="absolute inset-y-0 -right-px w-16 bg-gradient-to-l from-primary/[0.06] to-transparent" />
      </div>
    </div>
  );
}
