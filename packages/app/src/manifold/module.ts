import Module from "manifold-3d";

const wasm = await Module();
wasm.setup();

export { wasm };
