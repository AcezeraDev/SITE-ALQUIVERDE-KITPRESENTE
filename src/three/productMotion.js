// Exact solution of a damped spring (mass = 1), independent of display refresh rate.
export function spring(value = 0) {
  return { value, velocity: 0 };
}

export function advanceSpring(state, target, dt, stiffness = 100, damping = 17) {
  const half = damping / 2;
  const omega = Math.sqrt(stiffness - half * half);
  const displacement = state.value - target;
  const coefficient = (state.velocity + half * displacement) / omega;
  const decay = Math.exp(-half * dt);
  const cos = Math.cos(omega * dt), sin = Math.sin(omega * dt);
  state.value = target + decay * (displacement * cos + coefficient * sin);
  state.velocity = decay * ((coefficient * omega - half * displacement) * cos - (displacement * omega + half * coefficient) * sin);
  return state.value;
}

export function resetSpring(state, value) {
  state.value = value;
  state.velocity = 0;
}
