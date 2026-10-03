import { Children, Fragment, isValidElement } from "react";
import { TILES, type ImigongoMotif } from "@/components/imigongo";

/**
 * A male lion's head in side profile, facing right, traced from a reference
 * photograph and laid in imigongo.
 *
 * The structure is the photograph's, point for point, in its own 600 x 900
 * coordinates: the brow sloping into a long straight nose bridge, the heavy
 * muzzle with its rows of whisker spots, the closed mouth, the beard under the
 * chin, the eye set high and far back, the ear pricked in the mane, the crown
 * hair thrown up and back in wisps from round the ear, and the long locks
 * hanging down the neck and swelling forward over the chest.
 *
 * Imigongo is used where it helps the drawing and left out where it would
 * fight it. The mane alternates large patterned bands — zigzag, herringbone,
 * lozenge, turned to run with the hair — with plain ones carrying fine fur
 * strands, and a couple of locks are laid in solid nested triangles so they
 * read as the dark shadowed hair the photograph has. The face stays line work,
 * so its structure carries the likeness, with one row of chevrons down the
 * nose bridge.
 *
 * Placed against the left edge of the window, the mane runs off that edge and
 * the neck fades out at the foot, so the lion comes out of the edge, facing
 * across the band. Painted in `currentColor`; a server component with no
 * state, so it costs no script. The ids are fixed rather than passed in: there
 * is one lion, on one band.
 */

type Point = readonly [number, number];
type Curve = [Point, Point, Point, Point];

/** The part of the photograph's frame the drawing shows. */
const VIEW = { x: 0, y: 150, w: 560, h: 750 };

/** Rounded to a tenth of a unit, which is sub-pixel at any size used. */
const n = (value: number) => Math.round(value * 10) / 10;
const pt = ([x, y]: Point) => `${n(x)} ${n(y)}`;
const poly = (points: readonly Point[]) => `M${points.map(pt).join("L")}Z`;

// ---- Hair -------------------------------------------------------------------

/**
 * Hair along an edge: between each pair of points the outline swings out to a
 * tip and back, swept toward `sweep`. Depths vary on a fixed rhythm, never at
 * random, so the drawing is the same on every render. `side` picks which side
 * of the direction of travel is outward: 1 for the left, -1 for the right.
 */
function wisps(
  points: readonly Point[],
  depth: number,
  sweep: Point,
  side: 1 | -1 = 1,
) {
  const rhythm = [1, 0.55, 0.85, 0.65, 1.2, 0.75, 0.95];
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.hypot(dx, dy) || 1;
    const nx = (-dy / length) * side;
    const ny = (dx / length) * side;
    const k = depth * rhythm[i % rhythm.length];
    const tip: Point = [
      ax + dx * 0.7 + nx * k + sweep[0] * k,
      ay + dy * 0.7 + ny * k + sweep[1] * k,
    ];
    d +=
      `Q${pt([ax + nx * k * 0.6, ay + ny * k * 0.6])} ${pt(tip)}` +
      `Q${pt([ax + dx * 0.85 + nx * k * 0.2, ay + dy * 0.85 + ny * k * 0.2])} ${pt([bx, by])}`;
  }
  return d;
}

/** Evenly spaced points along a polyline, one every `step` units or so. */
function along(points: readonly Point[], step: number) {
  const out: Point[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const count = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let j = 1; j <= count; j++) {
      out.push([ax + ((bx - ax) * j) / count, ay + ((by - ay) * j) / count]);
    }
  }
  return out;
}

const curve = ([a, b, c, d]: Curve) => `M${pt(a)}C${pt(b)} ${pt(c)} ${pt(d)}`;

/** A band between two curves: out along one, across, back along the other. */
const band = (front: Curve, back: Curve) => {
  const [a, b, c, d] = back;
  return curve(front) + `L${pt(d)}C${pt(c)} ${pt(b)} ${pt(a)}Z`;
};

/** A point on a cubic. */
function onCurve([a, b, c, d]: Curve, t: number): Point {
  const u = 1 - t;
  return [
    u * u * u * a[0] +
      3 * u * u * t * b[0] +
      3 * u * t * t * c[0] +
      t * t * t * d[0],
    u * u * u * a[1] +
      3 * u * u * t * b[1] +
      3 * u * t * t * c[1] +
      t * t * t * d[1],
  ];
}

/**
 * A fur strand: a curve part-way `across` from one curve to the next, trimmed
 * at both ends so it floats inside the band rather than joining its edges.
 */
function strand(front: Curve, back: Curve, across: number) {
  const mix = (p: Point, q: Point): Point => [
    p[0] + (q[0] - p[0]) * across,
    p[1] + (q[1] - p[1]) * across,
  ];
  const middle: Curve = [
    mix(front[0], back[0]),
    mix(front[1], back[1]),
    mix(front[2], back[2]),
    mix(front[3], back[3]),
  ];
  return curve([
    onCurve(middle, 0.12),
    middle[1],
    middle[2],
    onCurve(middle, 0.8),
  ]);
}

// ---- The head ---------------------------------------------------------------

/**
 * The profile, from where the forehead leaves the hair: down the brow, along
 * the nose bridge, round the nose, down the muzzle to the upper lip, and in to
 * the closed mouth.
 */
const PROFILE =
  "M372 318 C385 330 394 344 400 358 C410 378 420 394 432 403 " +
  "C444 410 456 413 466 417 C480 423 492 431 500 440 C507 447 511 452 514 458 " +
  "C519 464 521 472 518 479 C515 486 510 492 504 497 " +
  "C504 506 504 520 502 530 C500 542 496 553 489 561 C485 565 482 567 480 568 " +
  "C484 573 484 579 481 584";

/** The beard under the chin, front to back, hanging in tufts. */
const BEARD = along(
  [
    [481, 584],
    [487, 604],
    [486, 624],
    [474, 641],
    [452, 651],
    [428, 650],
    [404, 648],
  ],
  12,
);
const BEARD_EDGE = wisps(BEARD, 9, [0, 0.6], -1);

/**
 * Where the face gives way to the hair of the ruff, from the throat back up to
 * the forehead. Not drawn — it is only the edge of the face's mask — so it
 * reads as fur meeting fur rather than as an outline.
 */
const CHEEK = along(
  [
    [404, 648],
    [382, 616],
    [366, 570],
    [357, 510],
    [352, 450],
    [352, 390],
    [362, 342],
    [372, 318],
  ],
  18,
);

const FACE = PROFILE + BEARD_EDGE + wisps(CHEEK, 8, [-0.4, 0.3], -1) + "Z";

const NOSE =
  "M480 463 C492 459 508 460 516 465 C520 470 520 478 516 484 " +
  "C513 490 510 494 505 496 C498 492 490 486 482 480 C478 474 477 468 480 463 Z";

/** The eye: set high and far back, with a catchlight cut out of it. */
const EYE =
  "M362 383 C372 375 386 380 397 398 C385 401 371 395 362 383 Z " +
  "M381 385 C384 385 386 387 386 389 C384 390 381 389 380 387 Z";

/** The closed mouth: the dark line between the lips. */
const LIPS = "M480 568 C455 578 420 590 378 598 C410 597 450 589 481 581 Z";

const LINES = [
  // The brow ridge over the eye.
  "M350 368 C366 358 388 364 406 382",
  // The crease running forward from the eye along the nose bridge.
  "M398 400 C416 408 436 416 456 424",
  // The line running down the cheek from the eye.
  "M398 404 C406 430 412 456 418 482",
  // The nostril.
  "M505 496 C500 488 493 482 484 479",
  // The whisker pad, bulging back from under the nose to the mouth.
  "M478 472 C450 480 416 490 402 510 C392 530 398 555 424 568",
  // The lower lip.
  "M481 584 C460 590 430 598 400 604",
  // Fur on the cheek, running down and back.
  "M380 430 C372 452 370 472 372 494 M366 470 C360 492 360 512 364 534",
].join(" ");

/**
 * The fine work, in a thinner line: the lids, creases on the forehead, the
 * fur of the cheek and jaw, the whiskers, the strands of the beard, and the
 * tufts inside the ear.
 */
const FINE = [
  // Lower lid.
  "M366 388 C374 394 386 398 396 399",
  // Upper lid, running on past the corner of the eye.
  "M360 381 C352 378 346 378 340 380",
  // Forehead creases above the brow.
  "M364 346 C374 344 384 348 392 356 M370 334 C378 333 386 338 392 344",
  // Fur on the cheek and jaw, running down and back.
  "M392 438 C386 456 384 474 386 492 M356 506 C352 526 354 546 360 562",
  "M372 548 C370 566 374 584 382 600 M392 612 C398 626 408 636 420 642",
  "M408 452 C404 470 402 486 404 500",
  // The ridge along the top of the muzzle to the nose.
  "M456 424 C468 434 476 446 480 462",
  // Whiskers, back from the pad and forward past the lips.
  "M424 514 C400 506 376 502 350 504 M418 527 C394 524 370 526 346 532",
  "M426 539 C402 542 380 550 360 562 M480 505 C500 504 522 506 546 512",
  "M474 518 C498 520 520 526 540 536 M468 532 C490 538 508 548 524 562",
  // Strands of the beard.
  "M470 600 C472 612 470 624 464 634 M452 604 C454 618 450 632 444 642",
  "M432 606 C432 620 428 634 424 644 M414 608 C412 620 410 632 408 642",
  // Tufts inside the ear.
  "M214 312 C222 306 230 300 236 292 M220 322 C228 316 236 308 242 298",
].join(" ");

/** The whisker spots, in staggered rows across the pad. */
const SPOTS = [
  [424, 514],
  [438, 511],
  [452, 508],
  [466, 506],
  [480, 505],
  [418, 527],
  [432, 524],
  [446, 521],
  [460, 519],
  [474, 518],
  [426, 539],
  [440, 536],
  [454, 534],
  [468, 532],
]
  .map(([x, y]) =>
    poly([
      [x, y - 2.6],
      [x + 2.6, y],
      [x, y + 2.6],
      [x - 2.6, y],
    ]),
  )
  .join("");

/**
 * Nested chevrons down the nose bridge, pointing to the nose: the one piece
 * of imigongo on the face.
 */
const BRIDGE = [0, 1, 2, 3]
  .map((i) => {
    const x = 424 + i * 16;
    const y = 404 + i * 8;
    return `M${x - 6} ${y - 9}L${x + 4} ${y + 1}L${x - 8} ${y + 5}`;
  })
  .join("");

// ---- The ear ----------------------------------------------------------------

/** Pricked, its tip up and forward, standing out of the mane. */
const EAR =
  "M236 336 C238 305 248 272 263 251 C240 262 212 278 196 300 " +
  "C205 318 220 330 236 336 Z";

/** The dark inside of the ear, inset from its rim. */
const EAR_INSIDE =
  "M232 326 C234 302 242 280 254 264 C236 274 216 288 206 302 " +
  "C212 314 222 322 232 326 Z";

// ---- The mane ---------------------------------------------------------------

/** The crown and back, from the forehead's hair over the top and off the left. */
const CROWN = along(
  [
    [382, 328],
    [360, 300],
    [345, 270],
    [330, 240],
    [300, 196],
    [270, 184],
    [220, 170],
    [160, 160],
    [120, 170],
    [80, 186],
    [40, 210],
    [0, 250],
    [-8, 262],
  ],
  26,
);

/** The front below the jaw, from the foot up to the throat. */
const CHEST = along(
  [
    [320, 906],
    [340, 860],
    [362, 820],
    [376, 780],
    [386, 740],
    [392, 700],
    [400, 664],
    [408, 648],
  ],
  24,
);

const MANE =
  `M${pt(CROWN[0])}` +
  wisps(CROWN, 26, [-0.35, -0.35]) +
  `L-8 906 L${pt(CHEST[0])}` +
  wisps(CHEST, 16, [0.05, 0.45]) +
  "L360 560 L350 420 Z";

/**
 * The line where the crown's hair, thrown up and back, gives way to the locks
 * hanging down the neck — just under the ear, as in the photograph.
 */
const PARTING_LINE: Point[] = [
  [-20, 424],
  [60, 382],
  [130, 354],
  [200, 344],
  [260, 338],
  [320, 328],
  [420, 320],
];

/** Height of the parting line at `x`, for hanging each lock from it. */
function partingY(x: number) {
  for (let i = 0; i < PARTING_LINE.length - 1; i++) {
    const [ax, ay] = PARTING_LINE[i];
    const [bx, by] = PARTING_LINE[i + 1];
    if (x <= bx) return ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  return PARTING_LINE[PARTING_LINE.length - 1][1];
}

/** Everything above the parting line: the crown's share of the mane. */
const CROWN_AREA = `M${PARTING_LINE.map(pt).join("L")}L420 100L-20 100Z`;

/** Everything below it: the hanging locks' share. */
const LOCKS_AREA = `M${PARTING_LINE.map(pt).join("L")}L420 920L-20 920Z`;

/**
 * The crown: strands thrown out from round the base of the ear, up and back
 * over the top of the head and off the left edge, each swept back as it goes.
 * Each runs past the mane's outline, which trims it.
 */
const CROWN_STRANDS = Array.from({ length: 11 }, (_, i): Curve => {
  const degrees = -30 - (i / 10) * 148;
  const turn = (d: number): Point => [
    Math.cos((d * Math.PI) / 180),
    Math.sin((d * Math.PI) / 180),
  ];
  const [ox, oy] = [225, 330];
  const out = turn(degrees);
  const swept = turn(degrees - 32);
  return [
    [ox + out[0] * 46, oy + out[1] * 46],
    [ox + out[0] * 130, oy + out[1] * 130],
    [ox + swept[0] * 210, oy + swept[1] * 210],
    [ox + swept[0] * 320, oy + swept[1] * 320],
  ];
});

/**
 * The locks hanging from the parting line down the neck, front to back. The
 * front ones swing forward over the chest, as the photograph's do; neighbours
 * bow opposite ways, so the locks swell and narrow. The first is only the far
 * edge of the front lock, set clear of the mane so that lock takes in the
 * whole ruff and chest.
 */
const LOCKS: Curve[] = [
  [
    [400, 250],
    [460, 400],
    [480, 700],
    [440, 910],
  ],
  ...Array.from({ length: 13 }, (_, i): Curve => {
    const x = 380 - i * 33 + (i % 3 === 1 ? 8 : 0);
    const top = partingY(x) - 14;
    const bulge = 34 * Math.max(0, 1 - i / 5);
    const sway = i % 2 ? 26 : -26;
    return [
      [x, top],
      [x - 8 + sway, top + 160],
      [x + bulge - sway, 660],
      [x - 34 + bulge * 0.6, 910],
    ];
  }),
];

// ---- Fills ------------------------------------------------------------------

/**
 * The patterns, large: a tile is 30 to 40 units across, so each motif reads as
 * imigongo at a glance rather than as a grey texture.
 */
type Fill = { motif: ImigongoMotif; scale: number; angle: number };

const FILLS: Record<string, Fill> = {
  herringbone: { motif: "herringbone", scale: 0.7, angle: 76 },
  zigzag: { motif: "zigzag", scale: 0.8, angle: 84 },
  lozenge: { motif: "lozenge", scale: 0.75, angle: 10 },
  shadow: { motif: "nested", scale: 0.7, angle: 0 },
};

/** Each hanging lock's fill, front to back; `null` leaves it plain. */
const LOCK_FILLS: (keyof typeof FILLS | null)[] = [
  "herringbone",
  null,
  "zigzag",
  null,
  "lozenge",
  // Just behind the ear, where the photograph's mane falls into shadow.
  "shadow",
  null,
  "zigzag",
  null,
  "herringbone",
  null,
  "lozenge",
  null,
];

/**
 * The crown's wedges alternate patterned and plain. A patterned wedge's motif
 * is turned to run out along its own strands, so the pattern follows the hair
 * as it sprays — which is why each needs a pattern of its own.
 */
const CROWN_MOTIFS: (ImigongoMotif | null)[] = [
  "zigzag",
  null,
  "herringbone",
  null,
  "zigzag",
  null,
  "lozenge",
  null,
  "zigzag",
  null,
];

const CROWN_FILLS = CROWN_MOTIFS.map((motif, i): Fill | null => {
  if (!motif) return null;
  const degrees = -30 - ((i + 0.5) / 10) * 148 - 16;
  return {
    motif,
    scale: motif === "lozenge" ? 0.7 : 0.75,
    angle: motif === "lozenge" ? degrees + 45 : degrees,
  };
});

/** Fine strands in every plain band, so no band reads as empty. */
function furIn(
  curves: Curve[],
  plain: (i: number) => boolean,
  across: number[] = [0.33, 0.66],
) {
  let d = "";
  for (let i = 0; i < curves.length - 1; i++) {
    if (!plain(i)) continue;
    for (const a of across) d += strand(curves[i], curves[i + 1], a);
  }
  return d;
}

const LOCK_FUR = furIn(LOCKS, (i) => LOCK_FILLS[i] === null);
const CROWN_FUR = furIn(CROWN_STRANDS, (i) => CROWN_FILLS[i] === null, [0.5]);

/**
 * Only the solid parts of a tile — the filled lozenge centres, the nested
 * triangles — with its outlines and zigzag strokes left out. The hover layer
 * is drawn from these, so it is the dark spots that take the colour.
 */
function solidsOf(paint: React.ReactNode): React.ReactNode {
  return Children.map(paint, (child) => {
    if (!isValidElement<{ fill?: string; children?: React.ReactNode }>(child)) {
      return child;
    }
    if (child.type === Fragment) return solidsOf(child.props.children);
    return child.props.fill && child.props.fill !== "none" ? child : null;
  });
}

function Pattern({
  id,
  fill,
  solids,
}: {
  id: string;
  fill: Fill;
  solids: boolean;
}) {
  const tile = TILES[fill.motif];
  return (
    <pattern
      id={id}
      width={tile.size}
      height={tile.size}
      patternUnits="userSpaceOnUse"
      patternTransform={`rotate(${n(fill.angle)}) scale(${fill.scale})`}
    >
      {solids ? solidsOf(tile.paint) : tile.paint}
    </pattern>
  );
}

export function LionArt({
  className,
  id = "lion",
  solids = false,
}: {
  className?: string;
  /** Prefix for the ids inside; each copy on a page needs its own. */
  id?: string;
  /**
   * Draw only the solid, dark parts — the filled pattern shapes, the inside
   * of the ear, the nose, the eye, the lips and the whisker spots — and none
   * of the line work. Laid exactly over a full copy, it is the layer the
   * hover colours.
   */
  solids?: boolean;
}) {
  const { x, y, w, h } = VIEW;
  const ref = (name: string) => `${id}-${name}`;
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      aria-hidden
      viewBox={`${x} ${y} ${w} ${h}`}
      className={`pointer-events-none block h-full w-full ${className ?? ""}`}
    >
      <defs>
        {Object.entries(FILLS).map(([name, fill]) => (
          <Pattern key={name} id={ref(name)} fill={fill} solids={solids} />
        ))}
        {CROWN_FILLS.map((fill, i) =>
          fill ? (
            <Pattern
              key={i}
              id={ref(`crown-${i}`)}
              fill={fill}
              solids={solids}
            />
          ) : null,
        )}

        {/* The mane shows only where the face and ear do not. */}
        <mask id={ref("mane-mask")} maskUnits="userSpaceOnUse">
          <path d={MANE} fill="#fff" />
          <path d={FACE} fill="#000" />
          <path d={EAR} fill="#000" />
        </mask>

        <clipPath id={ref("crown-clip")}>
          <path d={CROWN_AREA} />
        </clipPath>
        <clipPath id={ref("locks-clip")}>
          <path d={LOCKS_AREA} />
        </clipPath>

        {/* The neck fades out toward the foot instead of ending on a line,
            as the photograph's mane falls away into the dark. */}
        <linearGradient id={ref("fade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.68" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={ref("fade-mask")} maskUnits="userSpaceOnUse">
          <rect x={x - 10} y={y} width={w + 20} height={h} fill={url("fade")} />
        </mask>
      </defs>

      <g mask={url("fade-mask")}>
        <g mask={url("mane-mask")}>
          {/* The locks hanging below the parting line. */}
          <g clipPath={url("locks-clip")}>
            {LOCKS.slice(0, -1).map((front, i) => {
              const name = LOCK_FILLS[i];
              return name ? (
                <path key={i} d={band(front, LOCKS[i + 1])} fill={url(name)} />
              ) : null;
            })}
            {solids ? null : (
              <>
                <path
                  d={LOCKS.slice(1).map(curve).join("")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d={LOCK_FUR}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>

          {/* The crown above it, sprayed up and back. */}
          <g clipPath={url("crown-clip")}>
            {CROWN_STRANDS.slice(0, -1).map((front, i) =>
              CROWN_FILLS[i] ? (
                <path
                  key={i}
                  d={band(front, CROWN_STRANDS[i + 1])}
                  fill={url(`crown-${i}`)}
                />
              ) : null,
            )}
            {solids ? null : (
              <>
                <path
                  d={CROWN_STRANDS.map(curve).join("")}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d={CROWN_FUR}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>

          {solids ? null : (
            <path
              d={MANE}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            />
          )}
        </g>

        <g fill="currentColor">
          <path d={EAR_INSIDE} />
          <path d={NOSE} />
          <path d={EYE} fillRule="evenodd" />
          <path d={LIPS} />
          <path d={SPOTS} />
        </g>

        {solids ? null : (
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={EAR} strokeWidth="2.4" />
            <path d={PROFILE} strokeWidth="2.6" />
            <path d={`M${pt(BEARD[0])}${BEARD_EDGE}`} strokeWidth="2" />
            <path d={LINES} strokeWidth="2" />
            <path d={FINE} strokeWidth="1.1" />
            <path d={BRIDGE} strokeWidth="2.2" />
          </g>
        )}
      </g>
    </svg>
  );
}

/**
 * The eye alone, in the same frame as the drawing, so laid over a copy of the
 * lion it lands exactly on the lion's own eye. The membership band lights it
 * in oxblood while the page scrolls.
 */
export function LionEye({ className }: { className?: string }) {
  const { x, y, w, h } = VIEW;
  return (
    <svg
      aria-hidden
      viewBox={`${x} ${y} ${w} ${h}`}
      className={`pointer-events-none block h-full w-full ${className ?? ""}`}
    >
      <path d={EYE} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
