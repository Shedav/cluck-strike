// Cell widths; the scene passes them to Road.module.css as --lane-px and --start-px.
export const START_PX = 120
export const LANE_PX = 140

/** Horizontal centre of a cell: 0 is the start column, 1..n the Lanes. */
export const centreOf = (cell: number) =>
  cell === 0 ? START_PX / 2 : START_PX + (cell - 1) * LANE_PX + LANE_PX / 2
