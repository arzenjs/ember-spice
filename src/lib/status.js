export const STATUSES = ["confirmed", "arrived", "seated", "cancelled", "no_show"];

// Statuses that occupy seats and count towards capacity.
export const ACTIVE_STATUSES = ["confirmed", "arrived", "seated"];
export const SEAT_RELEASING_STATUSES = ["cancelled", "no_show"];

export const STATUS_LABELS = {
  confirmed: "Confirmed",
  arrived: "Arrived",
  seated: "Seated",
  cancelled: "Cancelled",
  no_show: "No-show",
};

// Allowed moves: from -> [to]. Seated, cancelled and no_show are final.
export const TRANSITIONS = {
  confirmed: ["arrived", "cancelled", "no_show"],
  arrived: ["seated", "confirmed", "cancelled"], // "confirmed" = undo an accidental check-in
  seated: [],
  cancelled: [],
  no_show: [],
};

export const ACTION_LABELS = {
  arrived: "Mark arrived",
  seated: "Mark seated",
  confirmed: "Undo arrival",
  cancelled: "Cancel",
  no_show: "No-show",
};

// Which targets each role may set. Kept explicit so permissions are easy to audit.
const ROLE_TARGETS = {
  staff: ["arrived", "seated", "confirmed", "cancelled", "no_show"],
  admin: ["arrived", "seated", "confirmed", "cancelled", "no_show"],
};

export const nextStatuses = (from, role) => TRANSITIONS[from]?.filter((to) => ROLE_TARGETS[role]?.includes(to)) ?? [];
export const canChangeStatus = (role, to) => Boolean(ROLE_TARGETS[role]?.includes(to));
// Statuses a reservation may currently have for a move to `to` to be legal (used in atomic updates).
export const allowedFromStatuses = (to) => STATUSES.filter((from) => TRANSITIONS[from].includes(to));
